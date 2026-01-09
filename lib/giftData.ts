
export interface SpecialDay {
    id: string;
    icon: string;
    color: string;
    textColor: string;
    badgeColor: string;
}

export const specialDays: SpecialDay[] = [
    { id: 'birthday', icon: '🎂', color: 'from-pink-100 to-purple-100', textColor: 'text-pink-600', badgeColor: 'bg-pink-600' },
    { id: 'wedding', icon: '💍', color: 'from-blue-100 to-cyan-100', textColor: 'text-blue-600', badgeColor: 'bg-blue-600' },
    { id: 'new_year', icon: '🎉', color: 'from-amber-100 to-yellow-100', textColor: 'text-amber-600', badgeColor: 'bg-amber-600' },
    { id: 'valentines', icon: '💝', color: 'from-red-100 to-rose-100', textColor: 'text-red-600', badgeColor: 'bg-red-600' },
    { id: 'womens_day', icon: '💐', color: 'from-fuchsia-100 to-pink-100', textColor: 'text-fuchsia-600', badgeColor: 'bg-fuchsia-600' },
    { id: 'mothers_day', icon: '🤱', color: 'from-rose-100 to-orange-100', textColor: 'text-rose-600', badgeColor: 'bg-rose-600' },
    { id: 'fathers_day', icon: '👨‍👧‍👦', color: 'from-sky-100 to-slate-100', textColor: 'text-slate-600', badgeColor: 'bg-slate-600' },
    { id: 'teachers_day', icon: '📚', color: 'from-emerald-100 to-teal-100', textColor: 'text-emerald-600', badgeColor: 'bg-emerald-600' },
    { id: 'christmas', icon: '🎄', color: 'from-green-100 to-red-100', textColor: 'text-green-700', badgeColor: 'bg-green-700' },
    { id: 'halloween', icon: '🎃', color: 'from-orange-100 to-amber-100', textColor: 'text-orange-600', badgeColor: 'bg-orange-600' },
    { id: 'baby_shower', icon: '🍼', color: 'from-blue-50 to-pink-50', textColor: 'text-purple-600', badgeColor: 'bg-purple-600' },
    { id: 'housewarming', icon: '🏡', color: 'from-stone-100 to-zinc-100', textColor: 'text-stone-600', badgeColor: 'bg-stone-600' },
    { id: 'graduation', icon: '🎓', color: 'from-indigo-100 to-violet-100', textColor: 'text-indigo-600', badgeColor: 'bg-indigo-600' },
    { id: 'thanksgiving', icon: '🦃', color: 'from-orange-100 to-amber-200', textColor: 'text-orange-700', badgeColor: 'bg-orange-700' },
    { id: 'eid', icon: '🌙', color: 'from-emerald-50 to-teal-100', textColor: 'text-emerald-600', badgeColor: 'bg-emerald-600' },
    { id: 'diwali', icon: '🪔', color: 'from-yellow-100 to-orange-100', textColor: 'text-orange-600', badgeColor: 'bg-orange-600' },
    { id: 'hanukkah', icon: '🕎', color: 'from-blue-100 to-cyan-200', textColor: 'text-blue-700', badgeColor: 'bg-blue-700' },
    { id: 'easter', icon: '🐰', color: 'from-purple-100 to-yellow-100', textColor: 'text-purple-600', badgeColor: 'bg-purple-600' }
];

// Helper to get suggestions keys
export const getSuggestionKeys = (dayId: string) => {
    // We assume there are 5 suggestions per day
    return ['1', '2', '3', '4', '5'];
};
