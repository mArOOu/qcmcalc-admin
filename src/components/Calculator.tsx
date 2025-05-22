"use client";

import { useState } from "react";
import CustomButton from "./CustomButton";

//Props and state
interface CalculatorProps {
  numQuestions: number;
  testType: string;
}

export default function Calculator({
  numQuestions,
  testType,
}: CalculatorProps) {
  const [correctAnswers, setCorrectAnswers] = useState<
    Record<number, string[]>
  >({});
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});
  const [result, setResult] = useState<{
    totalScore: number;
    grade: number;
    countedQuestions: number;
  } | null>(null);

  //Checkbox Handler
  const handleCheckboxChange = (
    questionNumber: number,
    type: string,
    letter: string
  ) => {
    if (type === "Correct") {
      setCorrectAnswers((prev) => {
        const current = prev[questionNumber] || [];
        if (current.includes(letter)) {
          return {
            ...prev,
            [questionNumber]: current.filter((item) => item !== letter),
          };
        } else {
          return {
            ...prev,
            [questionNumber]: [...current, letter],
          };
        }
      });
    } else {
      setUserAnswers((prev) => {
        const current = prev[questionNumber] || [];
        if (current.includes(letter)) {
          return {
            ...prev,
            [questionNumber]: current.filter((item) => item !== letter),
          };
        } else {
          return {
            ...prev,
            [questionNumber]: [...current, letter],
          };
        }
      });
    }
  };

  //Checkbox generation
  const generateCheckboxes = (questionNumber: number, type: string) => {
    const answers =
      type === "Correct"
        ? correctAnswers[questionNumber] || []
        : userAnswers[questionNumber] || [];

    return (
      <div className="flex flex-col gap-1 items-center">
        {["A", "B", "C", "D", "E"].map((letter) => (
          <div key={letter} className="flex items-center gap-1 w-full">
            <input
              type="checkbox"
              id={`${letter}${type}${questionNumber}`}
              className="absolute opacity-0 cursor-pointer h-0 w-0 peer"
              checked={answers.includes(letter)}
              onChange={() =>
                handleCheckboxChange(questionNumber, type, letter)
              }
            />
            <label
              htmlFor={`${letter}${type}${questionNumber}`}
              className="flex justify-center items-center 
              px-5 py-2.5 my-1
              bg-light text-dark
              border-2 border-solid border-dark
              rounded-3xl
              cursor-pointer select-none 
              transition-all duration-300 ease-linear 
              box-border w-full
              peer-checked:bg-blue peer-checked:text-light
              hover:peer-checked:bg-blue-400 hover:bg-light-300">
              {letter}
            </label>
          </div>
        ))}
      </div>
    );
  };

  //The acutal generation
  return (
    <div className="w-full mx-auto p-1">
      <div id="answerInputs" className="space-y-2 w-full">
        <div id="ctTitle" className="text-center mt-2">
          <h4 className="text-lg md:text-xl font-bold">
            Veuillez entrer les réponses correctes pour chaque question:
          </h4>
        </div>

        {/* Correct answers section */}
        {Array.from({ length: numQuestions }, (_, i) => (
          <div
            key={`correct-${i + 1}`}
            className="answer-group md:gap-2 md:mb-6 flex flex-col md:mx-50">
            <p className="text-base text-center mt-3 mb-2">
              <b>Question {i + 1}</b> <em>(Sélectionnez la bonne réponse)</em>
            </p>
            {generateCheckboxes(i + 1, "Correct")}
          </div>
        ))}
      </div>
    </div>
  );
}
