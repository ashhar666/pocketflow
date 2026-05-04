declare module 'js-cookie' {
  interface CookieAttributes {
    expires?: number | Date | undefined;
    path?: string | undefined;
    domain?: string | undefined;
    secure?: boolean | undefined;
    sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None' | undefined;
  }
  
  export function get(name: string): string | undefined;
  export function get(): { [key: string]: string };
  export function set(name: string, value: string, options?: CookieAttributes): string | undefined;
  export function remove(name: string, options?: CookieAttributes): void;
}
