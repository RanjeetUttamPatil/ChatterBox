import Room from "../models/Room.js";
import RoomMessage from "../models/RoomMessage.js";

export default function startRoomExpiryScheduler(io) {
  const tick = async () => {
    try {
      const now = new Date();
      const rooms = await Room.find({ isExpired: { $ne: true }, expiresAt: { $lte: now } }).limit(50);
      for (const room of rooms) {
        room.isExpired = true;
        await room.save();
        await RoomMessage.updateMany({ roomId: room._id }, { $set: { archived: true } });
        io.to(`room:${room._id}`).emit("room:expired", { roomId: room._id.toString() });
      }
    } catch (e) {
      console.error("roomExpiry tick:", e?.message || e);
    }
  };
  tick();
  const interval = setInterval(tick, 15 * 1000);
  return () => clearInterval(interval);
}
