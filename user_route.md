sequenceDiagram
    participant U as Käyttäjä
    participant C as Verkkosivusto
    participant WS as WebSocket Server
    participant P as Terminaalipohjainen Peli

    U->>C: Avaa verkkosivun
    C->>WS: Yhdistää WebSocket-yhteyden
    WS->>C: Vastaanottaa yhteyden
    C->>WS: Lähettää alkuviestit ja käyttäjän tiedot
    WS->>P: Lähettää pelin tilan kyselyt
    P->>WS: Välittää pelin tilan
    WS->>C: Päivittää pelin tila verkkosivulla
    U->>C: Syöttää peliin liittyviä komentoja
    C->>WS: Lähettää komennot WebSocketin kautta
    WS->>P: Välittää komennot peliin
    P->>WS: Päivittää pelitilaa
    WS->>C: Lähettää pelin tilan muutokset verkkosivulle
    C->>U: Päivittää pelin tila selaimessa
    U->>C: Poistuu verkkosivulta
    C->>WS: Lähettää irrottautumisviestin
    WS->>P: Ilmoittaa pelille pelaajan irrottautumisesta
    P->>WS: Vahvistaa irrottautuminen
    WS->>C: Lähettää viestin käyttäjän irrottautumisesta
    C->>U: Näyttää irrottautumisviestin

