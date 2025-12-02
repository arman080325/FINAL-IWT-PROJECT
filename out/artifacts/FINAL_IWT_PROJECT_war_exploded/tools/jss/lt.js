const fromText = document.querySelector(".from-text"),
      toText = document.querySelector(".to-text"),
      exchangeIcon = document.querySelector(".exchange"),
      selectTag = document.querySelectorAll("select"),
      icons = document.querySelectorAll(".row i"),
      translateBtn = document.querySelector("button");

// Populate dropdowns with countries/languages
selectTag.forEach((tag, id) => {
  for (let country_code in countries) {
    let selected =
      id === 0
        ? country_code === "en-GB"
          ? "selected"
          : ""
        : country_code === "hi-IN"
        ? "selected"
        : "";
    let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
    tag.insertAdjacentHTML("beforeend", option);
  }
});

// Swap text and language selections
exchangeIcon.addEventListener("click", () => {
  let tempText = fromText.value;
  let tempLang = selectTag[0].value;

  fromText.value = toText.value;
  toText.value = tempText;

  selectTag[0].value = selectTag[1].value;
  selectTag[1].value = tempLang;
});

// Clear output when input is empty
fromText.addEventListener("keyup", () => {
  if (!fromText.value) toText.value = "";
});

// Translation button click
translateBtn.addEventListener("click", () => {
  let text = fromText.value.trim(),
      translateFrom = selectTag[0].value,
      translateTo = selectTag[1].value;

  if (!text) return;

  toText.setAttribute("placeholder", "Translating...");
  translateBtn.disabled = true;

  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${translateFrom}|${translateTo}`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      toText.value = data?.responseData?.translatedText || "Translation not found.";
    })
    .catch(() => {
      toText.value = "Error fetching translation 😢";
    })
    .finally(() => {
      toText.setAttribute("placeholder", "Translation");
      translateBtn.disabled = false;
    });
});

// Copy / Speak icons
icons.forEach(icon => {
  icon.addEventListener("click", ({ target }) => {
    if (!fromText.value && !toText.value) return;

    if (target.classList.contains("fa-copy")) {
      const copyText = target.id === "from" ? fromText.value : toText.value;
      navigator.clipboard.writeText(copyText);
      target.style.color = "#00ffb7";
      setTimeout(() => (target.style.color = ""), 700);
    } else {
      const utteranceText = target.id === "from" ? fromText.value : toText.value;
      const utteranceLang = target.id === "from" ? selectTag[0].value : selectTag[1].value;
      const utterance = new SpeechSynthesisUtterance(utteranceText);
      utterance.lang = utteranceLang;
      speechSynthesis.speak(utterance);
    }
  });
});
