import { useEffect, useState, useRef, type ReactElement } from 'react';

import { ThumbsUp } from './svg/thumbs-up.jsx';
import { Guitar } from './svg/guitar.jsx';
import { Paintbrush } from './svg/paintbrush.jsx';
import { Notebook } from './svg/notebook.jsx';
import { Joystick } from './svg/joystick.jsx';
import { LaptopCheck } from './svg/laptop-check.jsx';
import { Dot } from './svg/dot.jsx';
import { Plus } from './svg/plus.jsx';
import { Logo } from './svg/logo.jsx';
import { ArrowRight } from './svg/arrow-right.jsx';

import { Select, type SelectHandle } from './components/Select/Select';
import { auth, getAuthHeaders } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';

import './App.css';

const AUTH_CACHE_KEY = 'powerhour-authed';

const selectMap : {[key: string] : ReactElement} = {
  'art': <Paintbrush />,
  'gamedev': <Joystick />,
  'programming': <LaptopCheck />, 
  'writing': <Notebook />,
  'music': <Guitar />, 
};

const themesMap : {[key: string] : ReactElement} = {
  'slate': <div className="theme-tile">
    <div className="theme-swatch" style={{boxShadow: '0 0 0 1px rgba(128,128,128,0.2)', background: "#fff"}}>
      <div style={{background: "#FFF"}}></div>
      <div style={{background: "rgba(128,128,128,0.2)"}}></div>
      <div style={{background: "rgb(240, 240, 245)"}}></div>
      <div style={{background: "#FFF"}}></div>
    </div>
  </div>,
  'acid': <div className="theme-tile">
    <div className="theme-swatch" style={{boxShadow: '0 0 0 1px black', background: '#bfff00'}}>
      <div style={{background: "#bfff00"}}></div>
      <div style={{background: "#000"}}></div>
      <div style={{background: "rgba(0,0,0,0.1)"}}></div>
      <div style={{background: "#fff"}}></div>
    </div>
  </div>,
  'midnight': <div className="theme-tile">
    <div className="theme-swatch" style={{boxShadow: '0 0 0 1px rgba(255,255,255,0.2)', background: "#000"}}>
      <div style={{background: "#000"}}></div>
      <div style={{background: "#222"}}></div>
      <div style={{background: "rgba(255,255,255,0.1)"}}></div>
      <div style={{background: "#fff"}}></div>
    </div>
  </div>,
  'lilac': <div className="theme-tile">
    <div className="theme-swatch" style={{boxShadow: '0 0 0 1px rgba(255,255,255,0.2)', background: "#000"}}>
      <div style={{background: "#4E4492"}}></div>
      <div style={{background: "#272342"}}></div>
      <div style={{background: "rgb(78, 68, 146, 0.75)"}}></div>
      <div style={{background: "#fff4ac"}}></div>
    </div>
  </div>,
}

type AccomplishmentType = keyof typeof selectMap;
type ThemeType = keyof typeof themesMap;

interface Accomplishment {
  id?: string;
  note: string;
  tags: AccomplishmentType[];
  created_at: string;
}

function App() {
  const [theme, setTheme] = useState<ThemeType>(localStorage.getItem('theme') || 'slate');
  const [selectOpen, setSelectOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [highlightedOption, setHighlightedOption] = useState<number>(0);
  const [theList, setTheList] = useState<Accomplishment[]>(JSON.parse(localStorage.getItem('accomplishments') || '[]'));
  const [inputValue, setInputValue] = useState<string>('');
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const [authed, setAuthed] = useState(() => localStorage.getItem(AUTH_CACHE_KEY) === 'true');

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typeSelectRef = useRef<SelectHandle | null>(null);

  const updateType = (type: string) => {
    setSelectedOption(type);
    setSelectOpen(false);
  }

  const updateTheme = (type : string) => {
    setTheme(type);
    localStorage.setItem('theme', type);
  };

  const submitAccomplishment = async () => {
    if (!inputValue) { return; }

    const newAccomplishment = {
      note: inputValue,
      tags: selectedOption ? [selectedOption as AccomplishmentType] : [],
      created_at: new Date().toISOString(),
    };
    
    const newList: Accomplishment[] = [newAccomplishment, ...theList];

    setTheList(newList);
    setInputValue('');
    setSelectOpen(false);
    setSelectedOption(null);

    localStorage.setItem('accomplishments', JSON.stringify(newList));

    await fetch('/api/accomplishments', {
      method: 'POST',
      headers: await getAuthHeaders({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({
        note: newAccomplishment.note,
        tags: newAccomplishment.tags,
      }),
    });

  };

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.scrollIntoView({behavior: 'smooth', block: 'end'});

      scrollRef.current?.addEventListener('scrollend', () => {
        inputRef.current?.focus();
      }, {once: true});
    }
  }

  const setAuthedState = (isAuthed: boolean) => {
    setAuthed(isAuthed);
    if (isAuthed) {
      localStorage.setItem(AUTH_CACHE_KEY, 'true');
    } else {
      localStorage.removeItem(AUTH_CACHE_KEY);
    }
  };

  const login = async () => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      if (!user.isAnonymous) {
        setAuthedState(true);
        setShowLogin(false);
        getAccomplishments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getAccomplishments = async () => {
    const accResponse = await fetch('/api/accomplishments');
    const accJSON = await accResponse.json();

    const newList: Accomplishment[] = [
      ...(accJSON.accomplishments || []), 
    ];
    setTheList(newList);
    localStorage.setItem('accomplishments', JSON.stringify(newList));
  };

  useEffect(() => {
    const scrollCheck = () => {
      if (scrollRef.current) {
        setScrollProgress(scrollRef.current.scrollTop);
      }
    };

    scrollRef.current?.addEventListener('scroll', scrollCheck);

    return () => {
      if (scrollRef.current) {
        scrollRef.current.removeEventListener('scroll', scrollCheck);
      }
    };
  }, [selectOpen, highlightedOption]);

  useEffect(() => {
    if (localStorage.getItem(AUTH_CACHE_KEY) === 'true') {
      getAccomplishments();
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const isAuthed = !!firebaseUser && !firebaseUser.isAnonymous;
      setAuthedState(isAuthed);
      if (isAuthed) {
        getAccomplishments();
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const keyListener = (e: KeyboardEvent) => {
      if (e.key === 'l' && e.shiftKey && e.metaKey) {
        setShowLogin(prev => !prev);
      }
    };

    document.addEventListener('keydown', keyListener);

    return () => {
      document.removeEventListener('keydown', keyListener);
    };
  }, []);

  const headerSize = window.innerWidth < 513 ? 2 : 4;
  const headerDiff = window.innerWidth < 513 ? 0.25 : 1;
  const paddingSize = window.innerWidth < 513 ? 2 : 4;
  const paddingDiff = window.innerWidth < 513 ? 1 : 2;
  
  return (
    <div className="app" onClick={() => setSelectOpen(false)} ref={scrollRef} data-theme={theme}>
      <div className="hero-container">
        <div className="hero" style={{
          fontSize: `${headerSize - (headerDiff * Math.min(1, scrollProgress / 108))}rem`,
          paddingBottom: `${paddingSize - (paddingDiff * Math.min(1, scrollProgress / 108))}rem`,
          paddingTop: window.innerWidth < 513 ? `${paddingSize - (paddingDiff * Math.min(1, scrollProgress / 108))}rem` : undefined,
        }}>
          Creative Power Hour
        </div>
      </div>
      <div className="tracker">
        {authed && (
          <div className="taskmaster">
            <div className="input">
              <input type="text" 
                ref={inputRef}
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                onKeyDown={async (e) => {
                  const input = e.target as HTMLInputElement;
                  if (e.code === 'Tab') {
                    e.preventDefault();
                    typeSelectRef.current?.open();
                    input.blur();
                  } else if (e.code === 'Enter') {
                    await submitAccomplishment();
                  }
                }}
              />
            </div>
            <Select
              ref={typeSelectRef} 
              options={selectMap}
              value={selectedOption}
              onChange={(type) => {
                updateType(type);
                inputRef.current?.focus();
              }}
              onHighlight={(type) => setHighlightedOption(type)}
            />
            <div className="submit-button"
              onClick={async () => {await submitAccomplishment()}}><ThumbsUp /></div>
          </div>
        )}
        <div className="accomplishments">
          {theList.map((item, index) => {
            return <div className="accomplishment" key={`accomplishment-${item.id ? item.id : `temp__${index}`}`}>
              <div className="accomplishment-text">{item.note}</div>
              <div className="datestamp">{item.created_at.split('T')[0]}</div>
              {item.tags.map((tag) => {
                return (
                  <div className="accomplishment-icon" key={`acc-type-${index}-${tag}`}>
                    {selectMap[tag] || <Dot />}
                  </div>
                )
              })}
            </div>
          })}
        </div>
        <div className="logo-footer"><Logo /></div>
        {showLogin && !authed && (
          <div className="login">
            <span>U:</span><input type="text" onChange={(e) => setEmail(e.target.value)}/>
            <span>P:</span><input type="password" onChange={(e) => setPassword(e.target.value)}/>
            <span onClick={login}><ArrowRight /></span>
          </div>
        )}
      </div>
      <div className="new-shortcut" onClick={focusInput}><Plus /></div>
      <div className="theme-changer">
        <Select 
          options={themesMap}
          value={theme as string}
          onChange={(type) => updateTheme(type)} />
      </div>
    </div>
  )
}

export default App
