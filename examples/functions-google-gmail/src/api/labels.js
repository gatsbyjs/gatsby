const axios = require("axios");

const handler = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const userId = req.headers.id;

    const labels = await axios
      .get(`https://gmail.googleapis.com/gmail/v1/users/${userId}/labels`, {
        headers: {
          authorization: token,
        },
      })
      .then(
        (response) => {
          let labelsList = [];
          const labels = response.data.labels;
          if (labels.length) {
            labels.forEach((label) => {
              labelsList.push(label.name);
            });
          }
          return labelsList;
        }, (error) => {
          console.error(error);
          return [];
        }
      );

    return res.status(200).json({ labels: labels });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "There was an error", error: err });
  }
};

module.exports = handler;