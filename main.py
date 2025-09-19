import pymupdf # imports the pymupdf library
import spacy 
import re
import nltk

pdf_path = "resume_file/Deepak_Baghel_Resume.pdf"
doc = pymupdf.open(pdf_path) # open a document
#nlp = spacy.load("en_core_web_sm")
'''
for page in doc: # iterate the document pages
  text = page.get_text() # get plain text encoded as UTF
  match = re.findall('\d+', text)    # extract all digits
  new_match = re.search('([a-zA-Z]+) (\d+)',text)  #extract string and thereafter intiger
  skills_section = re.findall(r'Skills\s*[:\-]*\s*(.+)', text, re.IGNORECASE) # extract all skills sections linearly
'''

skills_list = []
collect_skills = False
for page in doc:
    blocks = page.get_text("dict")["blocks"]
    for block in blocks:
        if "lines" in block:
            for line in block["lines"]:
                line_text = ""
                is_bold = False
                for span in line["spans"]:
                    line_text += span["text"] + " "
                    if span["flags"] in (20, 22):  # 20 or 22 means bold in PyMuPDF
                        is_bold = True
                
                line_text = line_text.strip()

                if is_bold:
                    # If line is bold
                    if "skill" in line_text.lower():
                        collect_skills = True
                        continue
                    elif collect_skills:
                        # Bold line but not 'Skills' heading -> Stop collection
                        collect_skills = False

                if collect_skills and line_text:
                    skills_list.append(line_text)
    print(skills_list)
    print("="*40)


  #doc = nlp(text)
  #for ent in doc.ents:  #diffrentiate text based on predefined groups
   # print(ent.text,ent.label_)  

      