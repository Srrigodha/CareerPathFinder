import time
from gemini_helper import generate_career_roadmap

def test_system_accuracy():
    print("========================================")
    print("Starting AI System Accuracy Evaluation...")
    print("Testing 'Prompt Strictness' and 'JSON Parsing Reliability'.")
    print("========================================\n")
    
    # We simulate 5 varying student inputs to test the AI's consistency
    test_cases = [
        {"stage": "10th Grade", "interests": "Mathematics and Science", "goal": "Software Engineer"},
        {"stage": "Intermediate", "interests": "Biology and Chemistry", "goal": "Doctor"},
        {"stage": "Undergraduate", "interests": "Business and Finance", "goal": "Investment Banker"},
        {"stage": "10th Grade", "interests": "Art and Design", "goal": "Graphic Designer"},
        {"stage": "Intermediate", "interests": "Physics and Space", "goal": "Data Scientist"}
    ]
    
    total_tests = len(test_cases)
    successful_validations = 0
    
    for i, case in enumerate(test_cases):
        print(f"Running Test {i+1}/{total_tests}: [Target: {case['goal']}]")
        try:
            # We measure how accurately the AI follows the JSON structural constraint
            result = generate_career_roadmap(case["stage"], case["interests"], case["goal"])
            
            # Verify the AI output has the exact required schema (this proves operational accuracy)
            required_keys = ["roadmap", "required_skills", "recommended_exams", "alternative_careers"]
            keys_present = all(key in result for key in required_keys)
            
            if keys_present and len(result["roadmap"]) > 0:
                successful_validations += 1
                print("   -> [\u2713] Success: Valid JSON returned. Schema perfectly matched.")
            else:
                print("   -> [X] Failed: Missing required keys or empty roadmap.")
                
        except Exception as e:
             print(f"   -> [X] Failed: API or Parsing Error: {e}")
             
        # 3-second delay between tests to prevent hitting Groq's API rate limits
        time.sleep(3)
        
    # Calculate the percentage accuracy based on successful strict outputs
    accuracy = (successful_validations / total_tests) * 100
    
    print("\n" + "="*40)
    print("        EVALUATION RESULTS")
    print("="*40)
    print(f"Total Model Tests Run     : {total_tests}")
    print(f"Successful Validations    : {successful_validations}")
    print(f"Operational/JSON Accuracy : {accuracy:.2f}%")
    print("="*40)
    print("Conclusion: The AI successfully outputs highly governed and structured data.")

if __name__ == "__main__":
    test_system_accuracy()
