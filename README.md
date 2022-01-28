# Powiadomienia SMS

## O projekcie

Aplikacja stworzona dla stacji kontroli pojazdów. Pozwala ona na rejestrację data badań technicznych oraz nr telefonów właścicieli pojazdów w celu wysłania do nich powiadomienia SMS na kilka dni przed upływem ważności badania technicznego.

## Technologie

Frontend projektu stworzony w [Next.js](https://nextjs.org/), backend to **API Next.js** oraz [Supabase](https://supabase.com/) jako baza danych. Dodatkowo aplikacja wykorzytsuje integrację z [SMSAPI](https://www.smsapi.pl/).

Bardzo zależało mi na autentykacji przy pomocy SMS OTP, niestety operatorzy dostępni w Supabase nie odpowiadali mi. Postanowiłem więc napisać autentykację i autoryzację samodzielnie ... pouczające doświadczenie :)

W aplikacji wykorzystałem m.in.:

- REACT (SFC, Hooks, Context API)
- JWT
- HttpOnly cookies
- Regular Expressions
- SSR
- PostgeSQL
- RestAPI
- SASS

## Podgląd

Nie mam niestety wersji live, którą mógłbym się podzielić. Zapraszam serdecznie do zapoznania się z prezentację tej aplikacji na moim kanale [YouTube](https://www.youtube.com/watch?v=4jKnqLMLHPQ).
