# Podsetnik za kliniku — Odontogram i procedure

> **Status:** Čeka odgovor iz klinike  
> **Prioritet:** Pre implementacije automatskog ažuriranja odontograma

---

## Kontekst (za razgovor)

Aplikacija trenutno ima dva odvojena dela:
1. **Odontogram** — grafički prikaz stanja svakog zuba (zdrav, karijes, plomba, kruna, izvađen...)
2. **Procedure po poseti** — šta je urađeno na poseti (ekstrakcija zuba 36, plomba zuba 16...)

Ova dva dela se trenutno NE ažuriraju međusobno. Doktor mora ručno ažurirati oba.

Razmišljamo o tome da aplikacija **predloži** ili **automatski ažurira** odontogram kada se doda procedura.

---

## Pitanja za kliniku

### 1. Kada se ažurira odontogram?

- Da li doktor ažurira odontogram **tokom posete** (u realnom vremenu)?
- Ili **na kraju posete** (kada su sve procedure završene)?
- Ili **na kraju dana** (batch unos)?
- Da li se odontogram ažurira **pre ili posle** upisivanja procedura?

---

### 2. Višeposetni tretmani (endodoncija, implanti, ortodoncija)

- Kada se status zuba menja pri endodonciji koja traje više poseta?
  - Na prvoj poseti (devitalizacija)?
  - Na poslednjoj (punjenje kanala, kruna)?
  - Između — postoji li prelazni status koji koristite?
- Da li postoji razlika između "zub se leči" i "zub je izlečen"?
- Kako beležite zub koji je u procesu lečenja a nije završen?

---

### 3. Greške i korekcije

- Koliko je česta situacija da se unese pogrešan broj zuba?
- Ako se odontogram ažurira automatski i greška se pronađe sutradan — koliko je to problem?
- Da li doktori redovno pregledaju odontogram na kraju posete ili je to retko?

---

### 4. Mapiranje procedura → stanje zuba

Ako aplikacija treba da "zna" da ekstrakcija znači `izvađen`, a plomba znači `plomba` — da li bi ovo mapiranje trebalo:

- Da bude unapred definisano (fiksno u aplikaciji)?
- Da owner klinike može da podesi (npr. "usluga Ekstrakcija = zub postaje izvađen")?
- Da doktor potvrdi svaki put pre nego što se primeni?

---

### 5. Šta bi bilo idealno iz perspektive doktora?

- Da aplikacija **automatski ažurira** odontogram bez ikakve akcije?
- Da aplikacija **predloži** izmenu i doktor klikne "Primeni" jednim klikom?
- Da se odontogram ažurira kao **deo toka završavanja posete** (pre klika "Završi posetu")?
- Da odontogram ostane **potpuno manualan** bez ikakve veze sa procedurama?

---

### 6. Složeni slučajevi

- Most (bridge) — obuhvata više zuba, kako se beleži?
- Implantat — da li se beleži na dan ugradnje ili na kraju oseointegracije?
- Privremena krunica vs. trajna krunica — razlikujete li ovo na odontogramu?
- Ortodontski pacijenti — da li se odontogram menja tokom ortodontskog tretmana ili samo na početku/kraju?

---

## Napomene za razvoj

Odgovor na ova pitanja određuje da li implementiramo:

| Opcija | Opis | Rizik |
|---|---|---|
| **A** | Suggestion chip pored procedure (preporučeno za sada) | Nizak — doktor svesno odlučuje |
| **B** | Odontogram review u "Završi posetu" modalu | Srednji — može dodati friction |
| **C** | Potpuno automatsko, bez potvrde | Visok — greška unosa kvari trajni zapis |
| **D** | Ostaje potpuno manualan | Nikakav — ali dupli unos iritira doktore |

**Trenutna implementacija:** Opcija D (potpuno manualan).  
**Preporučeni sledeći korak:** Opcija A, ali tek nakon potvrde iz klinike.
