interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const createThumbnail = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (error) => reject(error));
        img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    // Set visual size
    canvas.width = 200;
    canvas.height = 200;

    // Draw cropped image onto canvas
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        200,
        200
    );

    return canvas.toDataURL('image/jpeg', 0.8);
};
