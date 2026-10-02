import express from 'express'
import path from 'path';

export const getFile = async (req, res) => {
    const filePath = path.join(import.meta.dirname, '..', 'public', 'uploads', req.params.filename);
    // console.log(filePath)
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("File sending error:", err);
            res.status(404).send({ message: "File not found" });
        }
    })
}

