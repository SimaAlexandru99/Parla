from pymongo import MongoClient
import os
from dotenv import load_dotenv
import logging

# Configurarea logging-ului
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Încărcarea variabilelor de mediu
load_dotenv()

# Conectarea la MongoDB
MONGODB_CONNECTION_STRING = os.getenv("MONGODB_CONNECTION_STRING")
client = MongoClient(MONGODB_CONNECTION_STRING)


def add_words_to_project(project_name, words_dict):
    """
    Adaugă cuvinte specifice pentru un proiect în baza de date MongoDB.

    :param project_name: Numele proiectului (ex: "BCR")
    :param words_dict: Un dicționar cu categoriile de cuvinte și listele corespunzătoare
    :return: True dacă operația a fost realizată cu succes, False în caz contrar
    """
    try:
        db = client['optima_solutions_services']
        projects_collection = db['projects']

        project = projects_collection.find_one({"project_name": project_name})

        if not project:
            project = {"project_name": project_name}
            for category in words_dict.keys():
                project[category] = []

        cuvinte_adaugate = {category: 0 for category in words_dict.keys()}
        cuvinte_existente = {category: 0 for category in words_dict.keys()}

        for category, words in words_dict.items():
            if category not in project:
                project[category] = []

            for word in words:
                if word not in project[category]:
                    project[category].append(word)
                    cuvinte_adaugate[category] += 1
                else:
                    cuvinte_existente[category] += 1

        projects_collection.update_one(
            {"project_name": project_name},
            {"$set": project},
            upsert=True
        )

        for category in words_dict.keys():
            logging.info(
                f"Pentru categoria '{category}' în proiectul '{project_name}':")
            logging.info(f"  - Cuvinte adăugate: {cuvinte_adaugate[category]}")
            logging.info(
                f"  - Cuvinte deja existente: {cuvinte_existente[category]}")

        logging.info(
            f"Cuvintele au fost actualizate cu succes pentru proiectul '{project_name}'")
        return True

    except Exception as e:
        logging.error(
            f"Eroare la adăugarea cuvintelor pentru proiectul '{project_name}': {e}", exc_info=True)
        return False


# Exemplu de utilizare pentru proiectul BCR
bcr_words = {
    "common_words": ["BCR", "banca", "cont", "credit"],
    "positive_words": ["excelent", "multumit", "rapid"],
    "negative_words": ["nemultumit", "intarziere", "eroare"],
    "greetings_words": ["buna ziua", "salut"],
    "companies_names": ["Banca Comerciala Romana", "BCR"],
    "words_to_remove": ["umm", "aaa"],
    "availability_words": ["disponibil", "program"],
    "from_what_company": ["BCR", "Banca Comerciala Romana"],
    "good_bye_words": ["la revedere", "o zi buna"]
}


def actualizeaza_cuvinte_proiect_bcr():
    success = add_words_to_project("BCR", bcr_words)
    if success:
        print("Cuvintele au fost adăugate cu succes pentru proiectul BCR.")
    else:
        print("A apărut o eroare la adăugarea cuvintelor pentru proiectul BCR.")


if __name__ == "__main__":
    actualizeaza_cuvinte_proiect_bcr()
