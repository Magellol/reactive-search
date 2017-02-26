export default function request(endpoint) {
  return fetch(endpoint)
    .then((response) => {
      if (response.ok) {
        return response;
      }

      const error = new Error(
        `Error fetching "${endpoint}". ` +
        `Status code was "${response.status}".`,
      );

      return Promise.reject(error);
    });
}
