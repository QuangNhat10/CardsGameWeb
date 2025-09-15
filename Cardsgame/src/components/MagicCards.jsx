import React from "react";

const MagicCard = (props) => {
  const {
    name = "The Wise Mothman",
    manaCost = ["💧", "⚫", "⚫", "1"],
    imageUrl = "https://placehold.co/300x200",
    typeLine = "Legendary Creature — Insect Mutant",
    stats = { atk: 3, def: 3 },
    abilities = [
      "Flying",
      "Whenever one or more nonland cards are milled, put a +1/+1 counter on each of up to X target creatures, where X is the number of nonland cards milled this way.",
    ],
    variant = "monster",
  } = props;

  // Chọn màu nền theo loại thẻ
  const variantStyles = {
    monster: "from-gray-900 via-gray-800 to-gray-900 border-yellow-700",
    spell: "from-green-900 via-green-800 to-green-900 border-green-600",
    trap: "from-purple-900 via-purple-800 to-purple-900 border-purple-600",
  };

  return (
    <div
      className={`relative w-72 rounded-xl border-4 shadow-2xl overflow-hidden text-yellow-100 bg-gradient-to-b ${
        variantStyles[variant] || variantStyles.monster
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center px-3 py-1 bg-black/60 border-b text-sm font-bold">
        <span>{name}</span>
        <div className="flex space-x-1">
          {manaCost.map((cost, i) => (
            <span key={i} className="text-lg">
              {cost}
            </span>
          ))}
        </div>
      </div>

      {/* Artwork */}
      <div className="h-40 w-full bg-black">
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      </div>

      {/* Type Line */}
      <div className="px-3 py-1 bg-black/60 border-t border-b text-xs font-semibold italic">
        {typeLine}
      </div>

      {/* ATK/DEF */}
      <div className="flex justify-start px-3 pt-2">
        <div className="px-3 py-1 bg-black/80 rounded-lg font-bold text-sm text-yellow-300 shadow-lg drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">
          ATK {stats.atk} / DEF {stats.def}
        </div>
      </div>

      {/* Abilities */}
      <div className="px-3 py-2 bg-black/70 text-xs font-serif min-h-[100px]">
        {abilities.map((line, i) => (
          <p key={i} className="mb-1 leading-snug">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

export default MagicCard;
