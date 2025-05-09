'''
OpenAI Price Autofill (AI EXPERIMENT FOR SPRINT 4)

This file handles price autofill, so that sellers can have the option to get
their listing automatically priced if they are unsure of what they should sell
something for.

Author: Sofia DiCarlo, Class of 2025
'''
from openai import OpenAI
import json #< For private OPENAI_API_KEY
import os #< OS routines for NT or Posix depending on what system we're on.
import re #< regular expressions library

# Get the absolute path to the credentials file
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
cred_path = os.path.join(backend_dir, "pk3.json")

with open(cred_path, "r") as f:
    cfg = json.load(f)

client = OpenAI(
   api_key=cfg["OPENAI_API_KEY"] 
)

'''
get_price_prediction

Function that creates a price suggestion for a seller when creating a listing

PARAMETERS:
* category (dictionary of strings): The category(s) associated with listing
* name (string): Name of the listing
* (OPTIONAL) description (string): Description that seller writes for product, 
                                   is optional for OpenAI prompting. Optional
                                   meaning that description can be passed in as
                                   'None'
                    
Use the input parameters, pass them into the ai with a custom prompt to get a 
price that is good for college student.

RETURNS: 
Once the price has been returned, returns a upper-range price and lower-range 
in format [lower_price, upper_price]
'''
def get_price_prediction(category, name, description):
    
    # A fall-back for when a description is not provided, and is 'None'.
    description_text = description if description else "no description provided"
    
    # Format the category(s) for better prompting 
    # (dict -> "Categ_1, Categ_2, ...")
    if isinstance(category, dict):
        categories_formatted = ", ".join(category.values())
    elif isinstance(category, (list, tuple)):
        categories_formatted = ", ".join(category)
    else:
        categories_formatted = str(category)
    
    # Generate price autofill response 
    response = client.responses.create(
        model="gpt-4.1-nano",
        instructions="Do not restate the prompt, just provide the price range for the item with no dollar signs in this format: <lower price>-<upper price>",
        input=f"Give me a good general price for {name}, in the {categories_formatted} category(s), described as {description_text}"
        )
    
    # Store suggestion
    suggestion = response.output_text
    
    # INPUT VALIDATION: Make sure that 'suggestion' variable has the correct
    #   format: "<lower_price>-<upper_price>"
    match = re.search(r'(\d+)\s*-\s*(\d+)', suggestion)
    if match:
        lower_bound = int(match.group(1))
        upper_bound = int(match.group(2))
    else:
        raise ValueError(f"Could not parse price range from: {suggestion}")
    
    # OpenAI suggests this price range: 
    return  {
    "minPrice": lower_bound,
    "maxPrice": upper_bound}

'''
Test function to test OpenAI prompting. Feel free to edit the test inputs.
'''
def price_fill_test():
    
    # Test category (dictionary of strings)
    category = {
        1: "Utensils",
        2: "Kitchen"
    }
    # Test listing name (string)
    name = "Large serrated kitchen knife"
    # Test description (OPTIONAL)
    description = None
    
    # Call the OpenAI prompt
    prediction = get_price_prediction(category, name, description)
    print(f"OpenAI suggests this price range for {name}:", prediction)
    

# Call test function to view the ai
price_fill_test()

'''
******************************************************************************
AI TEST PROMPT
'''
# Test prompt that creates a haiku
# completion = client.chat.completions.create(
#   model="gpt-4.1-nano",
#   store=True,
#   messages=[
#     {"role": "user", "content": "write a haiku about ai"}
#   ]
# )

# # Test
# print(completion.choices[0].message)
'''
******************************************************************************
'''