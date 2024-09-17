from pymongo import MongoClient
import os
from dotenv import load_dotenv
import unicodedata

load_dotenv()
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")
client = MongoClient(MONGODB_CONNECTION_STRING)

# Definirea cuvintelor pentru fiecare categorie
COMMON_WORDS = {"și", "în", "la", "cu", "de",
                "pe", "pentru", "că", "din", "este"}
POSITIVE_WORDS = {"excelent", "minunat", "fantastic", "extraordinar",
                  "grozav", "perfect", "superb", "încântat", "mulțumit", "fericit"}
NEGATIVE_WORDS = {"prost", "rău", "groaznic", "teribil", "dezamăgitor",
                  "neplăcut", "oribil", "frustrant", "enervant", "nemulțumit"}
GREETINGS_WORDS = {"bună", "salut", "bună ziua", "bună seara",
                   "bună dimineața", "noroc", "servus", "ce faci", "ce mai faci", "sărut mâna"}
COMPANIES_NAMES = {"Optima", "Vodafone", "Orange", "Telekom",
                   "RCS & RDS", "Digi", "Enel", "Electrica", "Engie", "EON"}
WORDS_TO_REMOVE = {"ăăă", "mmm", "păi", "așadar", "deci",
                   "practic", "în fine", "cum să spun", "să zicem", "mă rog"}
AVAILABILITY_WORDS = {"disponibil", "liber", "în program", "deschis",
                      "accesibil", "prezent", "la dispoziție", "gata", "pregătit", "neocupat"}
FROM_WHAT_COMPANY = {"de la", "din partea", "reprezentant", "agent", "compania",
                     "firma", "societatea", "organizația", "întreprinderea", "corporația"}
GOOD_BYE_WORDS = {"la revedere", "o zi bună", "pa", "toate cele bune", "ne auzim",
                  "pe curând", "să aveți o zi frumoasă", "rămâneți cu bine", "noapte bună", "weekend plăcut"}


def remove_diacritics(text):
    """
    Elimină diacriticele din text.
    """
    return ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')


def adauga_cuvinte_in_baza_de_date(cuvinte, categorie):
    """
    Adaugă cuvinte în baza de date 'word_database' pentru o categorie specifică,
    inclusiv versiunile fără diacritice.
    """
    db = client['word_database']
    colectie = db[categorie]
    cuvinte_adaugate = 0
    cuvinte_existente = 0

    for cuvant in cuvinte:
        cuvant_fara_diacritice = remove_diacritics(cuvant.lower())
        for varianta in [cuvant, cuvant_fara_diacritice]:
            if not colectie.find_one({"word": varianta}):
                colectie.insert_one({"word": varianta})
                cuvinte_adaugate += 1
            else:
                cuvinte_existente += 1

    print(f"Pentru categoria '{categorie}':")
    print(f"  - Cuvinte și variante adăugate: {cuvinte_adaugate}")
    print(f"  - Cuvinte și variante deja existente: {cuvinte_existente}")


def actualizeaza_baza_de_date_cuvinte():
    """
    Funcție principală pentru actualizarea bazei de date cu cuvinte pentru toate categoriile,
    inclusiv variante fără diacritice.
    """
    categorii = {
        "common_words": COMMON_WORDS,
        "positive_words": POSITIVE_WORDS,
        "negative_words": NEGATIVE_WORDS,
        "greetings_words": GREETINGS_WORDS,
        "companies_names": COMPANIES_NAMES,
        "words_to_remove": WORDS_TO_REMOVE,
        "availability_words": AVAILABILITY_WORDS,
        "from_what_company": FROM_WHAT_COMPANY,
        "good_bye_words": GOOD_BYE_WORDS
    }

    for categorie, cuvinte in categorii.items():
        adauga_cuvinte_in_baza_de_date(cuvinte, categorie)

    print("Actualizarea bazei de date cu cuvinte a fost finalizată.")


if __name__ == "__main__":
    actualizeaza_baza_de_date_cuvinte()
