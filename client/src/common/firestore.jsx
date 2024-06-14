import axios from 'axios';

export const uploadImage = async (img) => {
    let imgUrl = null;

    await axios.get(import.meta.env.VITE_SERVER_URL + '/get-upload-url')
    .then(async ({ data: { uploadURL } }) => {
        console.log('Received upload URL:', uploadURL)
        const formData = new FormData();
        formData.append('file', img);

        await axios({
            method: 'PUT',
            url: uploadURL,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(() => {
            imgUrl = uploadURL.split('?')[0];
        })
    })
    .catch((error) => {
        console.error('Error uploading image:', error);
    });

    return imgUrl;
};
