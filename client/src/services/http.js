class HttpService {
    async fetch(url, method, data) {
        const options = {
            credentials: 'same-origin'
        };

        if (method) {
            options.method = method;
        }

        if (data) {
            options.body = JSON.stringify(data);
            options.headers = {
                'content-type': 'application/json'
            };
        }

        let response;
        try {
            response = await fetch(url, options);
        } catch (error) {
            throw {
                data: 'Unable to connect to the server'
            };
        }

        if (!response.ok) {
            const data = await response.json();
            throw {
                data,
                status: response.status
            };
        }

        return await response.json();
    }

    get(url) {
        return this.fetch(url);
    }

    post(url, data) {
        return this.fetch(url, 'POST', data);
    }

    patch(url, data) {
        return this.fetch(url, 'PATCH', data);
    }

    delete(url, data) {
        return this.fetch(url, 'DELETE', data);
    }
}

export default new HttpService();
