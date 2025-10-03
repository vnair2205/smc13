import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Modal } from '../common/Modal';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ModalContent = styled.div`
    text-align: center;
`;

const Button = styled.button`
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.primary};
  color: #1e1e2d;
  cursor: pointer;
  margin: 0.5rem;
`;

const CropContainer = styled.div`
    margin: 1rem 0;
    display: flex;
    justify-content: center;
`;

const ProfilePicModal = ({ isOpen, onClose, onSave }) => {
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);

    const onSelectFile = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setImgSrc(reader.result.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    function onImageLoad(e) {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
            width,
            height
        );
        setCrop(crop);
    }

    const handleSaveCrop = () => {
        if (!completedCrop || !imgRef.current) {
            return;
        }
        // In a real app, you'd upload the cropped image blob to your server/S3
        // For now, we'll pass the cropped data URL back to the parent
        onSave(imgRef.current, completedCrop);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <h2>Update Profile Picture</h2>
                <input type="file" accept="image/*" onChange={onSelectFile} />

                {imgSrc && (
                    <CropContainer>
                        <ReactCrop
                            crop={crop}
                            onChange={c => setCrop(c)}
                            onComplete={c => setCompletedCrop(c)}
                            aspect={1}
                            circularCrop
                        >
                            <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} alt="Crop me" />
                        </ReactCrop>
                    </CropContainer>
                )}

                <div>
                    <Button onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSaveCrop} disabled={!completedCrop}>Save Picture</Button>
                </div>
            </ModalContent>
        </Modal>
    );
};

export default ProfilePicModal;