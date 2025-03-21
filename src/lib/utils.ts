import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] + ' ' + 
    date.toTimeString().split(' ')[0];
}

export class Logger {
  logs: string[] = [];

  log(message: string) {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;
    this.logs.push(formattedMessage);
    console.log(formattedMessage);
    return formattedMessage;
  }

  clear() {
    this.logs = [];
  }
}

export interface UserInfo {
  name?: string;
  profileImage?: string;
  walletAddress?: string;
  email?: string;
} 