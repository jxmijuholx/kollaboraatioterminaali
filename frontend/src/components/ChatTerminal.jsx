import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

const ChatTerminal = ({ username, sendMessage, action, viesti }) => {
  const terminalRef = useRef(null);
  const term = useRef(null);
  const inputBuffer = useRef('');



  useEffect(() => {
    if (!term.current && terminalRef.current) {
      // Luodaan terminaali
      term.current = new Terminal({
        cursorBlink: true,
        rows: 20,
        cols: 80,
        convertEol: true,
      });

      term.current.open(terminalRef.current);
      term.current.writeln('Welcome to the chat kollaboratioterminal, try chatting!');
      term.current.prompt = () => {
        const promptColor = '\x1b[34m';
        const promptText = `${promptColor}${username}:\x1b[0m $ `;
        term.current.write(promptText);
      };

      term.current.prompt();

      // Käsittele käyttäjän syöttämä viesti
      term.current.onData((data) => {
        if (data === '\r') {
          const message = inputBuffer.current.trim();
          if (message) {
            sendMessage(message); // Lähetä viesti App.jsx:ään
            // term.current.writeln(`\r\n${username}: ${message}`); // Näytä viesti terminaalissa
            // console.log("Viesti lähetyksestä")
            inputBuffer.current = ''; // Tyhjennä bufferi
          }
          term.current.write('\r\n');
          term.current.prompt();
        } else if (data === '\u007F') {
          // Backspace-painallus
          if (inputBuffer.current.length > 0) {
            inputBuffer.current = inputBuffer.current.slice(0, -1);
            term.current.write('\b \b');
          }
        } else {
          inputBuffer.current += data;
          term.current.write(data);
        }
      });
    }
  }, [sendMessage]);

  useEffect(() => {
    const storedClientId = localStorage.getItem('clientId'); // Haetaan clientID localStoragesta
  
    if (viesti && viesti.from && viesti.content) {
      console.log(viesti);
  
      // Tarkistetaan, että viesti ei ole tullut itseltä
      if (viesti.from !== storedClientId) {
        // Näytetään viestin lähettäjä ja viestin sisältö vain vastaanottajalle
        term.current.write(`\r\n${viesti.from}: ${viesti.content}\r\n`);
        
        // Näytetään uusi prompt
        term.current.prompt(); 
      }
    }
  }, [viesti]); // Päivitä terminaali, kun uusia viestejä on saatu

  

  // Tarkkaile pääkomponentista tulevaa toimintoa ja reagoi sen mukaan
  useEffect(() => {
    if (action) {
      switch (action) {
        case 'play':
          term.current.clear();
          term.current.writeln('Playing game...');
          break;
        case 'chat':
          term.current.reset();
          term.current.writeln('Switched to chat mode...');
          break;
        case 'clear':
          term.current.clear();
          break;
        case 'reset':
          term.current.reset();
          break;
        default:
          break;
      }
    }
  }, [action]); // Tämä hook kutsutaan aina kun action muuttuu

  return <div ref={terminalRef} style={{ flex: 1, border: '1px solid #ccc' }}></div>

};

export default ChatTerminal;
