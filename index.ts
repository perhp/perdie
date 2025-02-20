const server = Bun.serve<{ authToken: string }>({
    fetch(req, server) {
      const success = server.upgrade(req);
      if (success) {
        // Bun automatically returns a 101 Switching Protocols
        // if the upgrade succeeds
        return undefined;
      }
  
      // handle HTTP request normally
      return new Response("Hello world! 123");
    },
    websocket: {
      // this is called when a message is received
      async message(ws, message) {
        console.log(`Received ${message}`);
        // send back a message
        ws.send(`You said: ${message}`);
      },
    },
  });
  
  console.log(`Listening on ${server.hostname}:${server.port}`);