import http from './http';

class ApiService {
    signIn(data) {
        return http.post('/api/sign-in', data);
    }

    signOut() {
        return http.delete('/api/sign-out');
    }

    signOutSessions() {
        return http.delete('/api/sign-out-sessions');
    }

    getAllData() {
        return http.get('/api/client');
    }

    do(action) {
        return http.post('/api/action', {
            action
        });
    }
}

export default new ApiService();
