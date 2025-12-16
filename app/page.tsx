"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Gift, Sparkles, Upload, FileUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import * as XLSX from "xlsx";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("participants_draft");
    if (saved) {
      try {
        setParticipants(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("participants_draft", JSON.stringify(participants));
  }, [participants]);

  const addParticipant = () => {
    if (!name.trim()) return;
    if (participants.some(p => p.toLowerCase() === name.trim().toLowerCase())) {
      alert("Bu isim zaten ekli!");
      return;
    }
    setParticipants([...participants, name.trim()]);
    setName("");
  };

  const removeParticipant = (index: number) => {
    const newParticipants = [...participants];
    newParticipants.splice(index, 1);
    setParticipants(newParticipants);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    let newNames: string[] = [];

    try {
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv")) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Assume first column has names
        newNames = jsonData.flat().map(String).filter((s: string) => s && s.trim().length > 1);
      } else if (file.name.endsWith(".pdf")) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData
        });

        if (!res.ok) throw new Error("PDF Parsing Failed");

        const data = await res.json();
        newNames = data.names || [];
      } else {
        alert("Desteklenmeyen dosya formatı. Lütfen Excel (.xlsx) veya PDF kullanın.");
        setIsUploading(false);
        return;
      }

      if (newNames.length > 0) {
        // Append or Replace? 
        // For intuitive auto-draw flow, usually we just assume this is THE list.
        // But to be safe let's combine and filter duplicates.
        const combined = Array.from(new Set([...participants, ...newNames.map(n => n.trim())]));
        setParticipants(combined);

        // Auto Draw Trigger Check
        if (combined.length >= 3) {
          setTimeout(() => {
            if (confirm(`${newNames.length} isim eklendi (Toplam: ${combined.length}). Çekilişi başlatmak istiyor musunuz?`)) {
              triggerDraw(combined);
            }
          }, 500);
        } else {
          alert(`${newNames.length} isim eklendi, ancak çekiliş için en az 3 kişi gerekli.`);
        }
      } else {
        alert("Dosyadan isim okunamadı.");
      }
    } catch (error) {
      console.error(error);
      alert("Dosya yüklenirken bir hata oluştu.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerDraw = (currentParticipants: string[]) => {
    if (currentParticipants.length < 3) {
      alert("Çekiliş için en az 3 kişi gerekli!");
      return;
    }

    let shuffled = [...currentParticipants];
    let isValid = false;
    let attempts = 0;

    while (!isValid && attempts < 1000) {
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      isValid = true;
      for (let i = 0; i < currentParticipants.length; i++) {
        if (currentParticipants[i] === shuffled[i]) {
          isValid = false;
          break;
        }
      }
      attempts++;
    }

    if (!isValid) {
      alert("Bir hata oluştu, lütfen tekrar deneyin.");
      return;
    }

    const assignments: Record<string, string> = {};
    currentParticipants.forEach((p, i) => {
      assignments[p] = shuffled[i];
    });

    localStorage.setItem("secret_santa_assignments", JSON.stringify(assignments));
    router.push("/result");
  };

  const handleDraw = () => triggerDraw(participants);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-[#FFF5F5] to-white">
      {/* Decorative BG */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-red-200 rounded-full blur-[100px] opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-green-200 rounded-full blur-[100px] opacity-30 translate-x-1/3 translate-y-1/3"></div>

      <div className="z-10 w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full mb-4 shadow-sm border border-red-50">
            <Gift className="w-10 h-10 text-santa-red" strokeWidth={1.5} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Yula<span className="text-santa-red">Santa</span>
          </h1>
          <p className="text-gray-500 text-lg">
            Arkadaşlarını ekle, çekilişi başlat!
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white/50 space-y-6">
          <div className="flex gap-2">
            <Input
              placeholder="İsim giriniz..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addParticipant()}
              className="flex-1 bg-white/50"
            />
            <Button onClick={addParticipant} className="aspect-square p-0 w-12 rounded-2xl shrink-0">
              <Plus className="w-6 h-6" />
            </Button>
          </div>

          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
            {participants.length === 0 && (
              <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Henüz kimse eklenmedi</p>
              </div>
            )}
            {participants.map((p, i) => (
              <div key={i} className="group flex items-center justify-between p-3 pl-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-red-100">
                <span className="font-medium text-gray-700">{p}</span>
                <button
                  onClick={() => removeParticipant(i)}
                  className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xlsx, .xls, .csv, .pdf"
              onChange={handleFileUpload}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              className="w-full border-2 border-dashed border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-santa-red/50 hover:text-santa-red"
            >
              {isUploading ? "Yükleniyor..." : (
                <>
                  <FileUp className="w-4 h-4 mr-2" /> Toplu Liste Yükle (Excel/PDF)
                </>
              )}
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <Button
              onClick={handleDraw}
              className="w-full text-lg py-6 shadow-lg shadow-red-200/50 hover:shadow-xl hover:shadow-red-200/50 transition-all"
              variant="default"
              disabled={participants.length < 3}
            >
              <Sparkles className="w-5 h-5 mr-2" /> Çekilişi Yap
            </Button>
            {participants.length > 0 && participants.length < 3 && (
              <p className="text-xs text-red-500 mt-3 font-medium bg-red-50 py-2 rounded-lg">En az 3 kişi eklemelisiniz</p>
            )}
          </div>
        </div>

        <p className="text-gray-400 text-sm font-medium">
          🎄 Mutlu Yıllar!
        </p>
      </div>
    </main>
  );
}
