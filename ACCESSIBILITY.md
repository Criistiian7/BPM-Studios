# Accesibilitate - BeatPlanner

## Conformitate WCAG 2.1 Level AA

BeatPlanner este construit cu accent pe accesibilitate și urmează ghidurile WCAG 2.1 Level AA.

### Caracteristici de Accesibilitate Implementate

#### 1. Navigare prin Tastatură
- ✅ Toate elementele interactive sunt accesibile prin tastatură
- ✅ Ordinea focusului este logică și previzibilă
- ✅ Indicatori vizibili pentru focus (focus rings)
- ✅ Suport pentru tasta Escape (închide modaluri)

#### 2. Etichetare Semantică
- ✅ Toate form-urile au label-uri asociate corect
- ✅ Butoanele au texte descriptive sau aria-label
- ✅ Link-urile sunt clare și descriptive
- ✅ Heading-uri ierarhice corecte (h1, h2, h3)

#### 3. ARIA (Accessible Rich Internet Applications)
- ✅ role="alert" pentru mesaje de eroare
- ✅ role="dialog" și aria-modal pentru modaluri
- ✅ aria-label pentru elemente interactive fără text vizibil
- ✅ aria-required pentru câmpuri obligatorii
- ✅ aria-describedby pentru relații între elemente
- ✅ sr-only classes pentru text vizibil doar pentru screen readers

#### 4. Contrast de Culoare
- ✅ Raport de contrast minim 4.5:1 pentru text normal
- ✅ Raport de contrast minim 3:1 pentru text mare și elemente UI
- ✅ Suport complet pentru dark mode cu contrast optim

#### 5. Formulare Accesibile
- ✅ Label-uri explicit asociate cu input-uri prin htmlFor/id
- ✅ Placeholder text nu înlocuiește label-urile
- ✅ Mesaje de eroare clar marcate cu role="alert"
- ✅ Validare inline cu feedback vizual și textual
- ✅ Autocomplete atribute pentru datele utilizatorului

#### 6. Imagini și Media
- ✅ Toate imaginile au text alternativ descriptiv
- ✅ Imagini decorative marcate corespunzător
- ✅ Iconițe însoțite de text sau aria-label

#### 7. Dark Mode
- ✅ Toggle accesibil pentru light/dark mode
- ✅ Preferința salvată în localStorage
- ✅ Respectă preferința sistemului operării (prefers-color-scheme)
- ✅ Tranziții vizuale smooth între moduri

#### 8. Modaluri și Overlay-uri
- ✅ Focus trap în modaluri (focus rămâne în modal când e deschis)
- ✅ Închidere cu Escape
- ✅ Închidere cu click în afara modalului
- ✅ Restaurarea focusului după închidere
- ✅ Blocare scroll pe body când modalul este deschis

#### 9. Skip Links
- ✅ Skip to main content disponibil
- ✅ Vizibil la focus pentru utilizatorii de tastatură

#### 10. Responsive și Mobile-Friendly
- ✅ Design complet responsive
- ✅ Touch targets de minim 44x44px
- ✅ Text scalabil fără loss de funcționalitate
- ✅ Orientare portrait și landscape suportate

### Tehnologii Folosite

- **React** - Framework UI
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling cu utilități de accesibilitate
- **React Icons** - Iconițe accesibile
- **Firebase** - Backend și autentificare

### Testare

Pentru a testa accesibilitatea:

1. **Navigare cu Tastatura**: Folosește `Tab`, `Shift+Tab`, `Enter`, `Escape`
2. **Screen Readers**: Testează cu NVDA (Windows), JAWS (Windows), VoiceOver (macOS/iOS), TalkBack (Android)
3. **Zoom**: Testează la 200% zoom fără loss de funcționalitate
4. **Contrast**: Verifică cu tools precum Colour Contrast Analyser

### Raportare Probleme

Dacă descoperi probleme de accesibilitate, te rugăm să raportezi prin:
- GitHub Issues
- Email: accessibility@beatplanner.com

### Referințe

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

