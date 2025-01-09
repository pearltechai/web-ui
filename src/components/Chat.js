import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  Typography,
} from "@mui/material";
    
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setNewMessage(e.target.value)
    }
    
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: "user",
      time: new Date().toLocaleTimeString(),
    };

    setMessages(messages => [...messages, userMessage]);
    setIsLoading(true);
    setNewMessage("");

    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat/messages/chat/', {  // Note: Using relative URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),  // Add CSRF token
        },
        credentials: 'include',  // Important for cookies
        body: JSON.stringify({ message: newMessage }),
      });

      console.log('Response status:', response.status);
      const responseBody = await response.text();
      console.log('Response body:', responseBody);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = JSON.parse(responseBody);
      
      const assistantMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: "assistant",
        time: new Date().toLocaleTimeString(),
      };

      setMessages(messages => [...messages, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, there was an error processing your message.",
        sender: "assistant",
        time: new Date().toLocaleTimeString(),
      };
      setMessages(messages => [...messages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get CSRF token
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Paper sx={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        bgcolor: "#ffffff",
        maxWidth: "1000px",
        width: "100%",
        margin: "auto",
      }}>
        <List sx={{ 
          flex: 1, 
          overflow: "auto", 
          p: 2,
        }}>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                flexDirection: "column",
                alignItems: message.sender === "user" ? "flex-end" : "flex-start",
                bgcolor: message.sender === "user" ? "#f7f7f8" : "#ffffff",
                borderRadius: 2,
                mb: 1,
                width: "100%",
              }}
            >
              <Box sx={{ 
                maxWidth: "80%",
                p: 2,
              }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: message.sender === "user" ? "#374151" : "#000000",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message.text}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "#6B7280",
                    mt: 1,
                    display: "block",
                  }}
                >
                  {message.time}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>

        <Box sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: "divider",
          bgcolor: "#ffffff",
        }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ 
              display: "flex", 
              gap: 1,
              maxWidth: "800px",
              margin: "auto",
            }}>
              <TextField
                size="small"
                fullWidth
                value={newMessage}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                multiline
                maxRows={4}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />
              <Button 
                type="submit" 
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Send
              </Button>
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default Chat;