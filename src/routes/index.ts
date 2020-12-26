import router from './test';
export default function (app: any) {
    app.use('/', router);
}