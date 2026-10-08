'use client';

import React, { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Share2,
  Play,
  Trophy,
  Check,
  Copy,
  Flame,
  Shield,
  Send,
  AlertTriangle,
  Hand,
  Award,
  DollarSign,
  Users,
  Timer,
  Compass,
  Zap,
  Globe,
  Sliders,
  Dices,
  Swords,
  ChevronRight,
} from 'lucide-react';
import {
  GameType,
  StatType,
  Difficulty,
  STAT_REGISTRY,
  STAT_CATEGORIES,
  StatCategoryKey,
} from '@/lib/game-engine/types';
import { GAME_MODES } from '@/lib/game-engine/modes-data';
import { soundFX } from '@/lib/audio/sound-effects';

export default function CustomGameStudioPage() {
  const router = useRouter();

  // 1. Tipo de Juego
  const [gameType, setGameType] = useState<GameType>('higher');

  // 2. Estadística & Categoría
  const [selectedCategory, setSelectedCategory] = useState<StatCategoryKey>('ataque');
  const [stat, setStat] = useState<StatType>('goals');

  // 3. Competición
  const [competition, setCompetition] = useState('all');

  // 4. Temporada
  const [season, setSeason] = useState('2024/25');

  // 5. Número de Jugadores
  const [playerCount, setPlayerCount] = useState<number>(4);

  // 6. Posiciones
  const [positionFilter, setPositionFilter] = useState<'all' | 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Attacker' | '1-4-3-3'>('all');

  // 7. Nacionalidad
  const [nationality, setNationality] = useState('all');

  // 8. Club
  const [clubFilter, setClubFilter] = useState('all');

  // 9. Edad / Era
  const [ageEra, setAgeEra] = useState('all');

  // 10. Objetivo
  const [objective, setObjective] = useState<'max' | 'min' | 'exact' | 'closest' | 'limit' | 'target'>('max');

  // 11. Número de Rondas
  const [rounds, setRounds] = useState(5);

  // 12. Tiempo Límite
  const [timeLimit, setTimeLimit] = useState(15);

  // 13. Dificultad
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  // 14. Aleatoriedad
  const [randomness, setRandomness] = useState<'random' | 'fixed' | 'seed'>('random');
  const [customSeed, setCustomSeed] = useState('');

  // 15. Sistema de Puntuación
  const [speedBonus, setSpeedBonus] = useState(true);
  const [streakMultiplier, setStreakMultiplier] = useState(true);
  const [errorPenalty, setErrorPenalty] = useState(false);

  // 16. Modo de Juego
  const [playMode, setPlayMode] = useState<'solo' | '1v1' | 'friends'>('solo');

  // 17. Código y Enlace Compartible
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeModeInfo = GAME_MODES.find((m) => m.type === gameType) || GAME_MODES[0];
  const activeStatMeta = STAT_REGISTRY[stat] || STAT_REGISTRY.goals;

  const handleGenerateGame = () => {
    soundFX.playTap();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const seedParam = randomness === 'seed' && customSeed ? `&seed=${customSeed}` : randomness === 'fixed' ? `&seed=FIXED_${code}` : '';
    const compParam = competition !== 'all' ? `&comp=${competition}` : '';
    const posParam = positionFilter !== 'all' ? `&pos=${positionFilter}` : '';
    const natParam = nationality !== 'all' ? `&nat=${nationality}` : '';
    const clubParam = clubFilter !== 'all' ? `&club=${clubFilter}` : '';
    const ageParam = ageEra !== 'all' ? `&age=${ageEra}` : '';

    const url = `${window.location.origin}/game/${code}?type=${gameType}&stat=${stat}&diff=${difficulty}&rounds=${rounds}&time=${timeLimit}&count=${playerCount}&obj=${objective}&mode=${playMode}${compParam}${posParam}${natParam}${clubParam}${ageParam}${seedParam}`;

    setShareCode(code);
    setShareUrl(url);
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    soundFX.playTap();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const getCategoryIcon = (key: StatCategoryKey) => {
    switch (key) {
      case 'ataque': return <Flame className="h-4 w-4" />;
      case 'pase': return <Send className="h-4 w-4" />;
      case 'defensa': return <Shield className="h-4 w-4" />;
      case 'disciplina': return <AlertTriangle className="h-4 w-4" />;
      case 'porteros': return <Hand className="h-4 w-4" />;
      case 'carrera': return <Award className="h-4 w-4" />;
      case 'mercado': return <DollarSign className="h-4 w-4" />;
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-24">
      {/* TÍTULO CENTRADO */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-3.5 py-1 text-xs font-black uppercase text-emerald-400 mb-2">
          <Sparkles className="h-3.5 w-3.5" /> MOTOR MODULAR STATXI
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Crea tu Propio Minijuego
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">
          Personaliza las 17 variables del motor de juego: combina qué futbolistas, qué estadísticas, qué objetivo y qué reglas deseas poner a prueba.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* PANEL PRINCIPAL DE CONFIGURACIÓN (COL-8) */}
        <div className="lg:col-span-7 space-y-6">

          {/* 1. TIPO DE JUEGO */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black">
                1
              </span>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Tipo de Juego
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {GAME_MODES.map((m) => {
                const isSelected = gameType === m.type;
                return (
                  <button
                    key={m.type}
                    type="button"
                    onClick={() => {
                      soundFX.playTap();
                      setGameType(m.type);
                      if (m.type === 'lower') setObjective('min');
                      else if (m.type === 'higher') setObjective('max');
                      else if (m.type === 'exact') setObjective('exact');
                      else if (m.type === 'closest') setObjective('closest');
                      else if (m.type === 'limit') setObjective('limit');
                      else if (m.type === 'target') setObjective('target');
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-400 shadow-md shadow-emerald-500/20 text-white'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase block truncate">
                        {m.name}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-black ${
                        isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. ESTADÍSTICA AGRUPADA POR CATEGORÍAS */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black">
                2
              </span>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Estadística Principal
              </h2>
            </div>

            {/* Pestañas de categorías */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {STAT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => {
                      soundFX.playTap();
                      setSelectedCategory(cat.key);
                      setStat(cat.stats[0]);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {getCategoryIcon(cat.key)}
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Botones de estadísticas de la categoría activa */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
              {STAT_CATEGORIES.find((c) => c.key === selectedCategory)?.stats.map((sKey) => {
                const isSelected = stat === sKey;
                const meta = STAT_REGISTRY[sKey];
                return (
                  <button
                    key={sKey}
                    type="button"
                    onClick={() => {
                      soundFX.playTap();
                      setStat(sKey);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-black block truncate">{meta.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      ({meta.unit})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. UNIVERSO: COMPETICIÓN, TEMPORADA, CLUB Y NACIONALIDAD */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black">
                3
              </span>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Universo y Filtros de Club
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Competición */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                  🌍 Competición
                </label>
                <select
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="all">Todas las Competiciones</option>
                  <option value="140">LaLiga (España)</option>
                  <option value="39">Premier League (Inglaterra)</option>
                  <option value="2">UEFA Champions League</option>
                  <option value="78">Bundesliga (Alemania)</option>
                  <option value="135">Serie A (Italia)</option>
                  <option value="1">FIFA World Cup / Selecciones</option>
                </select>
              </div>

              {/* Temporada */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                  📅 Temporada
                </label>
                <select
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="2024/25">Temporada Actual (2024/25)</option>
                  <option value="2023/24">Temporada Anterior (2023/24)</option>
                  <option value="career">Carrera Completa (Acumulado)</option>
                  <option value="historical">Era Histórica (2010 - 2024)</option>
                </select>
              </div>

              {/* Clubes */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                  🏟️ Club
                </label>
                <select
                  value={clubFilter}
                  onChange={(e) => setClubFilter(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="all">Cualquier Club</option>
                  <option value="top_clubs">Top Clubs Europeos</option>
                  <option value="fc_barcelona">FC Barcelona</option>
                  <option value="real_madrid">Real Madrid</option>
                  <option value="man_city">Manchester City</option>
                  <option value="liverpool">Liverpool</option>
                  <option value="bayern">Bayern Munich</option>
                </select>
              </div>

              {/* Nacionalidad */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                  🌎 Nacionalidad
                </label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="all">Cualquier Nacionalidad</option>
                  <option value="spain">España</option>
                  <option value="argentina">Argentina</option>
                  <option value="france">Francia</option>
                  <option value="brazil">Brasil</option>
                  <option value="england">Inglaterra</option>
                  <option value="germany">Alemania</option>
                  <option value="south_america">Solo Sudamericanos</option>
                  <option value="europe">Solo Europeos</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. FILTROS DE FUTBOLISTAS: CANTIDAD, POSICIONES Y EDAD */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black">
                4
              </span>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Futbolistas y Posición
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Número de jugadores */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                  👕 N.º Futbolistas
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[2, 4, 7, 11].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setPlayerCount(count)}
                      className={`py-2 rounded-xl text-xs font-mono font-black ${
                        playerCount === count
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posición */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                  🧤 Posición
                </label>
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="all">Todas las posiciones</option>
                  <option value="Goalkeeper">Solo Porteros</option>
                  <option value="Defender">Solo Defensas</option>
                  <option value="Midfielder">Solo Centrocampistas</option>
                  <option value="Attacker">Solo Delanteros</option>
                  <option value="1-4-3-3">Formación 1-4-3-3</option>
                </select>
              </div>

              {/* Rango de edad */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                  👶 Rango de Edad
                </label>
                <select
                  value={ageEra}
                  onChange={(e) => setAgeEra(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="all">Cualquier edad</option>
                  <option value="u21">Menores de 21 (Sub-21)</option>
                  <option value="21-25">21 a 25 años</option>
                  <option value="26-30">26 a 30 años</option>
                  <option value="30plus">Veteranos (30+ años)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. REGLAS, RONDAS Y TIEMPO */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black">
                5
              </span>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Rondas, Tiempo y Objetivo
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Objetivo */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                  🎯 Objetivo
                </label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="max">Valor Máximo / Mayor</option>
                  <option value="min">Valor Mínimo / Menor</option>
                  <option value="exact">Número Exacto</option>
                  <option value="closest">Más Cercano</option>
                  <option value="limit">No superar Límite</option>
                  <option value="target">Alcanzar Objetivo</option>
                </select>
              </div>

              {/* Rondas */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                  🔢 Rondas ({rounds})
                </label>
                <div className="flex gap-1.5">
                  {[3, 5, 10, 15].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRounds(r)}
                      className={`flex-1 py-2 rounded-xl text-xs font-mono font-black ${
                        rounds === r
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tiempo */}
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1.5">
                  ⏱️ Tiempo por Ronda
                </label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
                >
                  <option value={10}>10 segundos (Rápido)</option>
                  <option value={15}>15 segundos (Estándar)</option>
                  <option value={20}>20 segundos</option>
                  <option value={30}>30 segundos</option>
                  <option value={60}>60 segundos (Táctico)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 6. DIFICULTAD Y PUNTUACIÓN */}
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black">
                6
              </span>
              <h2 className="text-sm font-black uppercase tracking-wider text-white">
                Dificultad y Bonificaciones
              </h2>
            </div>

            {/* Selector de Dificultad */}
            <div className="grid grid-cols-4 gap-2">
              {(['easy', 'medium', 'hard', 'expert'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    soundFX.playTap();
                    setDifficulty(d);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-black uppercase transition-all ${
                    difficulty === d
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Normal' : d === 'hard' ? 'Difícil' : 'Experto'}
                </button>
              ))}
            </div>

            {/* Toggles de Bonificaciones de Puntuación */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSpeedBonus(!speedBonus)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between cursor-pointer ${
                  speedBonus ? 'bg-emerald-500/15 border-emerald-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">Bonus Velocidad</span>
                  <span className="text-[10px] text-slate-400">+50 PTS si respondes rápido</span>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  speedBonus ? 'bg-emerald-500 border-emerald-400' : 'border-slate-700'
                }`}>
                  {speedBonus && <Check className="h-3 w-3 text-slate-950 stroke-[3]" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStreakMultiplier(!streakMultiplier)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between cursor-pointer ${
                  streakMultiplier ? 'bg-emerald-500/15 border-emerald-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">Racha x3</span>
                  <span className="text-[10px] text-slate-400">Multiplicadores seguidos</span>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  streakMultiplier ? 'bg-emerald-500 border-emerald-400' : 'border-slate-700'
                }`}>
                  {streakMultiplier && <Check className="h-3 w-3 text-slate-950 stroke-[3]" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setErrorPenalty(!errorPenalty)}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between cursor-pointer ${
                  errorPenalty ? 'bg-red-500/15 border-red-500/50 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}
              >
                <div>
                  <span className="text-xs font-bold block">Penalización</span>
                  <span className="text-[10px] text-slate-400">-50 PTS por fallo</span>
                </div>
                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                  errorPenalty ? 'bg-red-500 border-red-400' : 'border-slate-700'
                }`}>
                  {errorPenalty && <Check className="h-3 w-3 text-white stroke-[3]" />}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* RECUADRO LATERAL: VISTA PREVIA Y ACCIÓN GENERAR (COL-5) */}
        <div className="lg:col-span-5 sticky top-6 space-y-6">
          <div className="rounded-3xl bg-slate-900 border-2 border-emerald-500/40 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 h-32 w-32 bg-emerald-500/10 rounded-full blur-2xl" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> RECUADRO DEL JUEGO
              </span>
              <span className="text-[11px] font-mono font-black px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {playMode === 'solo' ? '1 JUGADOR' : playMode === '1v1' ? 'DUELO 1V1' : 'SALA PRIVADA'}
              </span>
            </div>

            {/* Recuadro Ilustrado de Vista Previa */}
            <div className="relative h-36 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-4 flex flex-col justify-between overflow-hidden shadow-inner mb-5">
              <div className="flex items-center justify-between z-10">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black font-mono text-[10px] uppercase">
                  {activeModeInfo.badge}
                </span>
                <span className="text-xs font-mono font-black text-emerald-400">
                  {rounds} RONDAS • {timeLimit}s
                </span>
              </div>

              <div className="z-10">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">
                  {activeModeInfo.name}
                </h3>
                <p className="text-xs text-emerald-300 font-bold flex items-center gap-1.5 mt-0.5">
                  <span>{activeStatMeta.label}</span>
                  <span>•</span>
                  <span>{difficulty.toUpperCase()}</span>
                </p>
              </div>

              {/* Tácticas decorativas */}
              <div className="absolute -bottom-6 -right-6 opacity-20 text-emerald-400">
                <Trophy className="h-28 w-28" />
              </div>
            </div>

            {/* Ficha Resumen de Reglas */}
            <div className="space-y-2.5 text-xs text-slate-300 divide-y divide-slate-800/80 mb-6">
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Estadística evaluada:</span>
                <strong className="text-emerald-400 font-mono">{activeStatMeta.label} ({activeStatMeta.unit})</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Competición:</span>
                <strong className="text-white">{competition === 'all' ? 'Todas' : competition === '140' ? 'LaLiga' : competition === '39' ? 'Premier League' : 'Champions League'}</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Formato de cartas:</span>
                <strong className="text-white">{playerCount} Futbolistas limpios</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Regla objetivo:</span>
                <strong className="text-emerald-400 uppercase">{objective}</strong>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-400">Multiplicador de racha:</span>
                <strong className="text-white">{streakMultiplier ? 'Activo (x1 a x3)' : 'Desactivado'}</strong>
              </div>
            </div>

            {/* Botón Principal Generar Juego */}
            <button
              onClick={handleGenerateGame}
              className="w-full arcade-btn-green py-4 rounded-2xl text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <Share2 className="h-5 w-5" /> GENERAR Y COMPARTIR JUEGO
            </button>

            {/* Caja de Enlace y Código Generado */}
            {shareCode && shareUrl && (
              <div className="mt-5 rounded-2xl bg-slate-950 border border-emerald-500/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Código de Sala:
                  </span>
                  <span className="font-mono text-base font-black text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                    {shareCode}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>

                <button
                  onClick={() => router.push(shareUrl)}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-black text-xs uppercase flex items-center justify-center gap-2 transition-colors border border-slate-700 cursor-pointer"
                >
                  <Play className="h-4 w-4 text-emerald-400 fill-emerald-400" /> Jugar Esta Partida Ahora
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
