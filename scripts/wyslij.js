// scripts/wyslij.js – wysyła formularz do serwera (POST /api/formularze)
const formularz = document.getElementById("formularz");
const komunikat = document.getElementById("komunikat");
const przycisk = formularz.querySelector(".przycisk_wyslij");

function pokazKomunikat(tekst, ok) {
  komunikat.textContent = tekst;
  komunikat.className = "komunikat " + (ok ? "komunikat_ok" : "komunikat_blad");
}

formularz.addEventListener("submit", async e => {
  e.preventDefault(); // nie przeładowuj strony

  const dane = {
    rodzaj_problemu: document.getElementById("rodzaj_problemu").value,
    skala_problemu: document.getElementById("skala_problemu").value,
    wiele_osob: document.getElementById("wiele_osob").checked,
    zdalnie: document.getElementById("zdalnie").checked,
    tytul: document.getElementById("tytul").value.trim(),
    opis: document.getElementById("opis").value.trim(),
    email: document.getElementById("email").value.trim(),
  };

  // Szybka walidacja po stronie przeglądarki (serwer sprawdza to jeszcze raz)
  if (!dane.tytul) return pokazKomunikat("Podaj krótki tytuł.", false);
  if (!dane.opis) return pokazKomunikat("Podaj opis problemu.", false);
  if (dane.email && !document.getElementById("email").checkValidity()) {
    return pokazKomunikat("Podany adres e-mail jest nieprawidłowy.", false);
  }

  przycisk.disabled = true;
  pokazKomunikat("Wysyłanie...", true);

  try {
    const odpowiedz = await fetch("/api/formularze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dane),
    });
    const wynik = await odpowiedz.json();

    if (odpowiedz.ok && wynik.ok) {
      pokazKomunikat(
        `Zapisano jako ${wynik.formularz.numer}.`,
        true,
      );
      formularz.reset(); 
    } else {
      pokazKomunikat(wynik.blad || "Nie udało się zapisać zgłoszenia.", false);
    }
  } catch (err) {
    pokazKomunikat(
      "Brak połączenia z serwerem. Czy działa `npm run dev`?",
      false,
    );
  } finally {
    przycisk.disabled = false;
  }
});
