import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  BookOpen,
  Plus,
  X,
  Pencil,
  MapPin,
  ArrowLeft,
  Save,
  Camera,
} from "lucide-react";
import type { User } from "@/types";
import { ProfileMediaGallery } from "@/components/ProfileMediaGallery";

interface ProfileViewProps {
  user: User;
  onSave: (updated: User) => void;
  onBack: () => void;
}

export function ProfileView({ user, onSave, onBack }: ProfileViewProps) {
  const [editName, setEditName] = useState(user.name);
  const [editLocation, setEditLocation] = useState(user.location);
  const [editBio, setEditBio] = useState(user.bio);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [teachSkills, setTeachSkills] = useState(user.teachSkills);
  const [learnSkills, setLearnSkills] = useState(user.learnSkills);
  const [newTeach, setNewTeach] = useState("");
  const [newLearn, setNewLearn] = useState("");
  const [editingIndex, setEditingIndex] = useState<{ type: "teach" | "learn"; idx: number } | null>(null);
  const [editValue, setEditValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = () => {
    onSave({
      ...user,
      name: editName,
      location: editLocation,
      bio: editBio,
      avatar: editAvatar,
      teachSkills,
      learnSkills,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return; // 2MB limit
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const addTeach = () => {
    if (newTeach.trim() && !teachSkills.includes(newTeach.trim())) {
      setTeachSkills([...teachSkills, newTeach.trim()]);
      setNewTeach("");
    }
  };

  const addLearn = () => {
    if (newLearn.trim() && !learnSkills.includes(newLearn.trim())) {
      setLearnSkills([...learnSkills, newLearn.trim()]);
      setNewLearn("");
    }
  };

  const removeTeach = (idx: number) => {
    setTeachSkills(teachSkills.filter((_, i) => i !== idx));
  };

  const removeLearn = (idx: number) => {
    setLearnSkills(learnSkills.filter((_, i) => i !== idx));
  };

  const startEdit = (type: "teach" | "learn", idx: number) => {
    setEditingIndex({ type, idx });
    setEditValue(type === "teach" ? teachSkills[idx] : learnSkills[idx]);
  };

  const commitEdit = () => {
    if (!editingIndex) return;
    const val = editValue.trim();
    if (!val) return;
    if (editingIndex.type === "teach") {
      setTeachSkills(teachSkills.map((s, i) => (i === editingIndex.idx ? val : s)));
    } else {
      setLearnSkills(learnSkills.map((s, i) => (i === editingIndex.idx ? val : s)));
    }
    setEditingIndex(null);
  };

  const inputCls =
    "w-full rounded-[10px] border border-[var(--glass-border)] bg-[var(--glass-input-bg)] px-4 py-2.5 text-sm text-primary-c placeholder:text-muted-c outline-none transition-colors focus:border-accent-c dark:border-[var(--glass-border)] dark:glass-panel dark:text-primary-c dark:placeholder:text-muted-c";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <button
        onClick={onBack}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-muted-c transition-colors hover:text-primary-c dark:text-muted-c dark:hover:text-primary-c"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header card */}
        <div className="rounded-[10px] border border-[var(--glass-border)] bg-white p-6 shadow-sm dark:border-[var(--glass-border)] dark:glass-panel">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Avatar with upload */}
            <div className="relative shrink-0">
              <img
                src={editAvatar}
                alt={editName}
                className="h-24 w-24 rounded-[10px] object-cover ring-2 ring-[var(--glass-border)] dark:ring-[var(--glass-border)]"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent-hover-c text-white shadow-lg transition-all hover:bg-accent-hover-c"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-c dark:text-muted-c">Name</label>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full border-none bg-transparent text-2xl font-bold tracking-tight text-primary-c outline-none dark:text-primary-c"
              />
              <div className="mt-3 flex items-center gap-1.5 text-sm text-muted-c dark:text-muted-c">
                <MapPin className="h-4 w-4" />
                <input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="Add your location"
                  className="border-none bg-transparent text-sm text-secondary-c outline-none placeholder:text-muted-c dark:text-faint-c dark:placeholder:text-muted-c"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-c dark:text-muted-c">
              Bio
            </label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Tell others about your experience and what you're looking for..."
            />
          </div>
        </div>

        {/* Skills sections */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Teaching Skills */}
          <div className="rounded-[10px] border border-[var(--glass-border)] bg-white p-6 shadow-sm dark:border-[var(--glass-border)] dark:glass-panel">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-primary-c dark:text-primary-c">
              <GraduationCap className="h-4 w-4 text-success-c dark:text-success-c" />
              Skills I Can Teach
            </h3>
            <div className="flex flex-wrap gap-2">
              {teachSkills.map((skill, idx) => (
                <div
                  key={`${skill}-${idx}`}
                  className="group flex items-center gap-1.5 rounded-full bg-success-light-c px-3 py-1.5 text-sm font-medium text-success-text-c dark:bg-success-soft-c dark:text-success-c"
                >
                  {editingIndex?.type === "teach" && editingIndex.idx === idx ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                      className="w-20 border-none bg-transparent text-sm text-success-text-c outline-none dark:text-success-c"
                    />
                  ) : (
                    <>
                      <span>{skill}</span>
                      <button
                        onClick={() => startEdit("teach", idx)}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button onClick={() => removeTeach(idx)} className="opacity-0 transition-opacity group-hover:opacity-100">
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={newTeach}
                onChange={(e) => setNewTeach(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTeach()}
                placeholder="Add a skill..."
                className={`${inputCls} text-sm`}
              />
              <button
                onClick={addTeach}
                className="flex shrink-0 items-center justify-center rounded-[10px] bg-success-c px-3 py-2 text-white transition-all hover:bg-success-c"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Learning Skills */}
          <div className="rounded-[10px] border border-[var(--glass-border)] bg-white p-6 shadow-sm dark:border-[var(--glass-border)] dark:glass-panel">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-primary-c dark:text-primary-c">
              <BookOpen className="h-4 w-4 text-danger-c dark:text-danger-c" />
              Skills I Want to Learn
            </h3>
            <div className="flex flex-wrap gap-2">
              {learnSkills.map((skill, idx) => (
                <div
                  key={`${skill}-${idx}`}
                  className="group flex items-center gap-1.5 rounded-full bg-danger-soft-c px-3 py-1.5 text-sm font-medium text-danger-text-c dark:bg-danger-soft-c dark:text-danger-c"
                >
                  {editingIndex?.type === "learn" && editingIndex.idx === idx ? (
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(e) => e.key === "Enter" && commitEdit()}
                      className="w-20 border-none bg-transparent text-sm text-danger-text-c outline-none dark:text-danger-c"
                    />
                  ) : (
                    <>
                      <span>{skill}</span>
                      <button
                        onClick={() => startEdit("learn", idx)}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button onClick={() => removeLearn(idx)} className="opacity-0 transition-opacity group-hover:opacity-100">
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={newLearn}
                onChange={(e) => setNewLearn(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLearn()}
                placeholder="Add a skill..."
                className={`${inputCls} text-sm`}
              />
              <button
                onClick={addLearn}
                className="flex shrink-0 items-center justify-center rounded-[10px] bg-danger-c px-3 py-2 text-white transition-all hover:bg-danger-c"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

          {/* Save button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-2 rounded-[10px] bg-accent-hover-c px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-accent-hover-c"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>

          {/* Skill Showcase Media Gallery */}
          <div className="mt-6">
            <ProfileMediaGallery userId={user.id} editable={true} />
          </div>
        </motion.div>
    </div>
  );
}
