import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import MailIcon from "@mui/icons-material/Mail";
import React from "react";

const Messages = (messages: any) => {
  return (
    <IconButton
      size="large"
      aria-label={`show ${messages.length} new messages`}
      color="inherit"
    >
      <Badge badgeContent={messages.length} color="error">
        <MailIcon />
      </Badge>
    </IconButton>
  );
}

export default Messages