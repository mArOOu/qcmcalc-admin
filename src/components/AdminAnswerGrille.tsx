"use client";

import { useState, useEffect, useCallback } from "react";
import { ClipboardPaste, Trash2, X } from "lucide-react";
import { parseAnswersText } from "@/lib/qcm-parser";

interface AdminAnswerGrilleProps {
  numQuestions: number;
  answers: Record<number, string[]>;
  onChange: (answers: Record<number, string[]>) => void;
  label?: string;
}

const LETTERS = ["A", "B", "C", "D", "E"];

export default function AdminAnswerGrille({
  numQuestions,
  answers,
  onChange,
  label = "Clé de Correction des Questions",
}: AdminAnswerGrilleProps) {
  const [activeQuestion, setActiveQuestion] = useState<number>(1);
  const [isPasteOpen, setIsPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const toggleLetter = useCallback(
    (qNum: number, letter: string) => {
      const current = answers[qNum] || [];
      let updated: string[];
      if (current.includes(letter)) {
        updated = current.filter((l) => l !== letter);
      } else {
        updated = [...current, letter].sort();
      }
      onChange({
        ...answers,
        [qNum]: updated,
      });
    },
    [answers, onChange]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      if (LETTERS.includes(key)) {
        e.preventDefault();
        toggleLetter(activeQuestion, key);
        return;
      }

      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setActiveQuestion((prev) => (prev < numQuestions ? prev + 1 : prev));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveQuestion((prev) => (prev > 1 ? prev - 1 : prev));
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        onChange({
          ...answers,
          [activeQuestion]: [],
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeQuestion, answers, numQuestions, onChange, toggleLetter]);

  const parsedPaste = parseAnswersText(pasteText, numQuestions);
  const detectedCount = Object.keys(parsedPaste).length;

  const handleApplyPaste = () => {
    onChange({
      ...answers,
      ...parsedPaste,
    });
    setIsPasteOpen(false);
    setPasteText("");
  };

  const answeredCount = Object.keys(answers).filter(
    (key) => (answers[Number(key)] || []).length > 0
  ).length;

  return (
    <div className="w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <span>{label}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {answeredCount}/{numQuestions} définies
            </span>
          </h4>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cliquez sur les lettres pour cocher les réponses justes, ou collez le corrigé complet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPasteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 transition cursor-pointer">
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Coller le Corrigé (Saisie Rapide)</span>
          </button>

          {answeredCount > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm("Effacer toutes les réponses définies pour ce contrôle ?")) {
                  onChange({});
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Effacer</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
        <div
          className="bg-blue-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.round((answeredCount / (numQuestions || 1)) * 100)}%` }}
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[500px] overflow-y-auto pr-1">
        {Array.from({ length: numQuestions }, (_, i) => {
          const qNum = i + 1;
          const current = answers[qNum] || [];
          const isAnswered = current.length > 0;
          const isActive = activeQuestion === qNum;

          return (
            <div
              key={qNum}
              onClick={() => setActiveQuestion(qNum)}
              className={`flex items-center justify-between p-2 px-3 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? "bg-zinc-800 border-blue-500/80 shadow ring-1 ring-blue-500/30"
                  : isAnswered
                  ? "bg-zinc-950/70 border-zinc-800"
                  : "bg-zinc-950/30 border-zinc-800/50 opacity-70 hover:opacity-100"
              }`}>
              <span
                className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : isAnswered
                    ? "bg-zinc-800 text-zinc-200"
                    : "bg-zinc-900 text-zinc-500"
                }`}>
                Q{qNum < 10 ? `0${qNum}` : qNum}
              </span>

              <div className="flex items-center gap-1">
                {LETTERS.map((letter) => {
                  const isChecked = current.includes(letter);
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveQuestion(qNum);
                        toggleLetter(qNum, letter);
                      }}
                      className={`w-8 h-9 sm:w-7 sm:h-7 rounded-lg text-xs font-bold transition flex items-center justify-center select-none active:scale-90 touch-manipulation cursor-pointer ${
                        isChecked
                          ? "bg-blue-600 text-white shadow-sm ring-1 ring-blue-400"
                          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
                      }`}>
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Saisie Rapide Modal */}
      {isPasteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-blue-400" />
                <h4 className="font-bold text-white text-base">Coller la Clé Officielle</h4>
              </div>
              <button
                type="button"
                onClick={() => setIsPasteOpen(false)}
                className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Collez le texte du corrigé (ex: <code className="text-zinc-200">1: A,B, 2: C, 3: D...</code> ou <code className="text-zinc-200">AB, C, D...</code>). Le système extrait automatiquement les bonnes réponses.
            </p>

            <textarea
              rows={7}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="1: AC&#10;2: B&#10;3: D, E&#10;4: A"
              className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-medium">
                {detectedCount > 0 ? `✓ ${detectedCount} réponses détectées` : "En attente de texte..."}
              </span>
              <button
                type="button"
                onClick={() => setPasteText("")}
                className="text-zinc-400 hover:text-zinc-200 underline">
                Effacer
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPasteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition">
                Annuler
              </button>
              <button
                type="button"
                disabled={detectedCount === 0}
                onClick={handleApplyPaste}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition disabled:opacity-50 cursor-pointer">
                Appliquer à la grille ({detectedCount})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
