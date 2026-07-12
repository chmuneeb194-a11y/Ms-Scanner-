
import cv2
import pytesseract
import sympy as sp
import re

def scan_and_process_image(image_path):
    print("[INFO] Image scan ho rahi hai...")
    
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    processed_img = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]

    custom_config = r'--oem 3 --psm 6'
    extracted_text = pytesseract.image_to_string(processed_img, config=custom_config)
    
    print("\n--- [Computerized Text] ---")
    print(extracted_text.strip())
    print("----------------------------\n")

    math_pattern = r'[0-9\s\+\-\*\/\(\)\=]+'
    matches = re.findall(math_pattern, extracted_text)
    
    print("--- [Math Solver Result] ---")
    for match in matches:
        clean_match = match.strip().replace('=', '')
        if len(clean_match) > 2 and any(char in clean_match for char in '+-*/'): 
            try:
                result = sp.sympify(clean_match)
                print(f"Sawal: {clean_match} = Jawab: {result}")
            except Exception as e:
                pass
    print("----------------------------\n")
    
    return extracted_text

if __name__ == "__main__":
    print("GitHub Repository Setup Ready! Image path de kar check karein.")
  
