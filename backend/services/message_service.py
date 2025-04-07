import firebase_admin
from firebase_admin import credentials, db


def get_db_root():
    # check if app exists, init if not
    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate("pk.json")
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://reuseu-e42b8-default-rtdb.firebaseio.com/'
        })
    # get root ref
    ref = db.reference('/')
    return ref

ref = get_db_root()

#Inputs: dictionary account data of form:
# {LastTime': last_time,
#'MessageContent': message_content,
#'UserID': user_id,
#'ListingID': listing_id}
def add_message(message_data):
    # notice we read the number of accounts here and increment by 1
    messages = ref.child('Message').get()
    new_key = str(len(messages)) if messages else "1"
    message_data['MessageID'] = new_key
    listing_id_temp = message_data['ListingID']
    message_data.pop("ListingID")
    ref.child('Message').child(new_key).set(message_data)

    target_chat = None
    chat_exists = False
    chats = ref.child('Chat').get()
    for chat in chats:
        for field, value in chat.items():
            if field == 'ListingID':
                if int(value) == listing_id_temp:
                    target_chat = chat
                    chat_exists = True

    if chat_exists:
        target_chat["Messages"] = target_chat["Messages"].append(message_data)
        ref.child('Chat').child(new_key).set(target_chat)
    else:
        new_key = listing_id_temp
        new_chat = {}
        new_chat["ListingID"] = listing_id_temp
        new_chat["Messages"] = [message_data]
        ref.child('Chat').child(new_key).set(new_chat)




def delete_message(message_id):
    listingid = ref.child('Message').child(str(message_id))['ListingID']
    ref.child('Message').child(str(message_id)).delete()
    chats = ref.child('Chat').get()

    target_chat = None
    chat_exists = False
    chats = ref.child('Chat').get()
    for chat in chats:
        for field, value in chat.items():
            if field == 'ListingID':
                if int(value) == listingid:
                    target_chat = chat
                    chat_exists = True
    if chat_exists:
        target_chat["Messages"] = target_chat["Messages"].append(message_data)
        ref.child('Chat').child(new_key).set(target_chat)
    else:
        print("Chat does not exist")