# modules/call_info.py

from modules.utils import get_index

def extract_call_info(call_title):
    if not isinstance(call_title, str):
        raise TypeError("Titlul apelului trebuie să fie un șir de caractere.")
    parts = call_title.split('_')
    agent_index = get_index(parts, 'E')
    agent_name = parts[agent_index] if agent_index is not None and agent_index < len(parts) else None

    if agent_name:
        first_name, last_name = agent_name.split('.')
        agent_info = {
            "username": first_name + '.' + last_name,
            "first_name": first_name.capitalize(),
            "last_name": last_name.capitalize()
        }
    else:
        agent_info = {
            "username": None,
            "first_name": None,
            "last_name": None
        }

    day_index = get_index(parts, 'D')
    day = parts[day_index] if day_index is not None and day_index < len(parts) else None

    clid_index = get_index(parts, 'CLID')
    phone_number_with_extension = parts[clid_index] if clid_index is not None and clid_index < len(parts) else None
    phone_number = phone_number_with_extension.split('.')[0] if phone_number_with_extension else None

    final_status = parts[-1].replace('.wav', '')

    return agent_info, day, phone_number, final_status
