"use client";

interface AlertMessageProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export default function AlertMessage({
  type,
  message,
}: AlertMessageProps) {
  if (!message) return null;

  const styles = {
    success: {
      backgroundColor: "#003300",
      color: "#00ff88",
      border: "1px solid #006600",
    },
    error: {
      backgroundColor: "#330000",
      color: "#ff4d4d",
      border: "1px solid #aa0000",
    },
    warning: {
      backgroundColor: "#332900",
      color: "#ffcc00",
      border: "1px solid #aa8800",
    },
    info: {
      backgroundColor: "#001f33",
      color: "#33ccff",
      border: "1px solid #006699",
    },
  };

  return (
    <div
      style={{
        marginBottom: "15px",
        padding: "10px",
        borderRadius: "4px",
        ...styles[type],
      }}
    >
      {message}
    </div>
  );
}