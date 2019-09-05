/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';
import router from 'umi/router';

const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
};


/**
 * 异常处理程序
 */
const errorHandler = error => {
    const { response = {} } = error;
    const errortext = codeMessage[response.status] || response.statusText;
    const { status, url } = response;
    if (!status) {
        notification.error({ message: error.message });
        return;
    }
    if (status == 401) {
        router.push('/login');
        return;
    }
    notification.error({
        message: `请求错误 ${status}: ${url}`,
        description: errortext,
    });
};

let url = "http://localhost:49911/api/v1/";
if (process.env.NODE_ENV === "production") {
    url = "https://api.nayoung515.top/api/v1/";
}

const request = extend({
    headers: {
        'Accept': 'application/json'
    },
    errorHandler, // 默认错误处理
    credentials: 'include', // 默认请求是否带上cookie,
    prefix: url,
});


// request拦截器
request.interceptors.request.use((url, options) => {
    let token = localStorage.getItem("x-access-token");
    let headers = { ...options.headers };
    if (url.indexOf("image") == -1) {
        headers = Object.assign(headers, {
            'Content-Type': 'application/json'
        });
    }
    if (token) {
        const addheaders = {
            'x-refresh-token': localStorage.getItem('x-refresh-token'),
            'Authorization': token
        }
        headers = Object.assign(headers, addheaders);
    }
    return (
        {
            url: `${url}`,
            options: { ...options, headers: headers },
        }
    )
});

// response拦截器
request.interceptors.response.use((response, options) => {
    let token = response.headers.get("authorization");
    if (token) {
        localStorage.setItem('x-access-token', token);
    }
    return response;
});


export default request;
