// Avatar 
const getInitials = (name = "") => {
   const parts = name.trim().split(" ").filter(Boolean);

   if (parts.length === 0) return "?";
   if (parts.length === 1) return parts[0][0].toUpperCase();

   return (
      parts[0][0].toUpperCase() +
      parts[parts?.length - 1][0].toUpperCase()
   );
};

const stringToGradient = (string) => {
   let hash = 0;
   for (let i = 0; i < string?.length; i++) {
      hash = string?.charCodeAt(i) + ((hash << 5) - hash);
   }

   const hue1 = hash % 360;
   const hue2 = (hash * 1.3) % 360;

   return `linear-gradient(135deg, 
    hsl(${hue1}, 70%, 60%), 
    hsl(${hue2}, 70%, 50%)
  )`;
};

const Avatar = ({ name = "", size = 45, border }) => {
   const initials = getInitials(name);
   const gradient = stringToGradient(name);

   return (
      <div className={`font-avatar ${border && "border-1 border-[#000000]"}`}
         style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: gradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "black",
            fontWeight: "500",
            fontSize: size / 2,
            userSelect: "none",
         }}
      >
         {initials}
      </div>
   );
};

export default Avatar;