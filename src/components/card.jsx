import React from "react";

export function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-card text-card-foreground rounded-lg shadow p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "", ...props }) {
  return (
    <div className={`mb-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = "", ...props }) {
  return (
    <h2 className={`font-bold text-xl ${className}`} {...props}>
      {children}
    </h2>
  );
}

export function CardDescription({ children, className = "", ...props }) {
  return (
    <p className={`text-muted-foreground ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "", ...props }) {
  return (
    <div className={`my-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = "", ...props }) {
  return (
    <div
      className={`mt-2 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
