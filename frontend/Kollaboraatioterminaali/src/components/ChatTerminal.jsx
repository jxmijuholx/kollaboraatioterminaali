import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

const ChatTerminal = ({ ws, gameID, username, sendMessage, getMessage }) => {
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
      term.current.writeln('Welcome to the chat terminal!');
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
            term.current.writeln(`\r\n${username}: ${message}`); // Näytä viesti terminaalissa
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
  }, [ws, gameID, username, sendMessage]);

  // Näytetään vastaanotetut viestit terminaalissa
  useEffect(() => {
    const messages = getMessage(); // Hae viestit App.jsx:stä
    if (term.current && messages.length > 0) {
      messages.forEach((message) => {
        term.current.writeln(`\r\n${message.from}: ${message.content}`);
      });
    }
  }, [getMessage]); // Päivitä terminaali, kun uusia viestejä on saatu

  return <div ref={terminalRef} style={{ width: 'auto', height: 'auto' }}></div>;
};

export default ChatTerminal;
