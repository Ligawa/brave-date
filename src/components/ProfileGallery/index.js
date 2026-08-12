import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarIcon from "@mui/icons-material/Star";
import axios from "axios";
import { Server } from "../../utils";

const ProfileGallery = ({ editable = false, photos = [], onChange }) => {
  const inputRef = useRef(null);
  const [items, setItems] = useState(photos || []);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setItems(photos || []);
    if (!photos?.length && localStorage.getItem("token")) {
      axios.get(`${Server.endpoint}/user/profile-photos`, request()).then(({ data }) => setItems(data.result || [])).catch(() => {});
    }
  }, [photos]);

  const request = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = String(reader.result).split(",")[1];
        await axios.post(`${Server.endpoint}/user/profile-image`, { base64, content_type: file.type, size_bytes: file.size }, request());
        const { data } = await axios.get(`${Server.endpoint}/user/profile-photos`, request());
        setItems(data.result || []);
        onChange?.(data.result || []);
      } finally { setBusy(false); }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const remove = async (id) => {
    setBusy(true);
    try {
      await axios.delete(`${Server.endpoint}/user/profile-photos/${id}`, request());
      const next = items.filter((photo) => photo.id !== id);
      setItems(next);
      onChange?.(next);
    } finally { setBusy(false); }
  };

  return (
    <Box className="profile-gallery">
      <Box className="profile-gallery-heading">
        <Box><Typography className="profile-gallery-title">Your photos</Typography><Typography className="profile-gallery-subtitle">Show your authentic self.</Typography></Box>
        {editable && <Button onClick={() => inputRef.current?.click()} disabled={busy} startIcon={<AddPhotoAlternateIcon />}>Add photo</Button>}
        {editable && <input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} />}
      </Box>
      <Box className="profile-gallery-grid">
        {items.map((photo, index) => <Box className="profile-gallery-item" key={photo.id || photo.url}>
          <img src={photo.url} alt={`Portrait ${index + 1}`} />
          {index === 0 && <Box className="profile-gallery-primary"><StarIcon /> Primary</Box>}
          {editable && <Button aria-label={`Delete photo ${index + 1}`} className="profile-gallery-delete" onClick={() => remove(photo.id)}><DeleteOutlineIcon /></Button>}
        </Box>)}
        {editable && items.length < 6 && <Button className="profile-gallery-add" onClick={() => inputRef.current?.click()}><AddPhotoAlternateIcon /><span>Add another</span></Button>}
      </Box>
    </Box>
  );
};

export default ProfileGallery;
