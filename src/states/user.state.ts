import { injectable } from "inversify";
import { observable, action } from "mobx";
import { queryByPage, addUser, deleteUser, UpdateStatus, updateUser, getCurrentUser } from "@/services/user.service";
import { ITableListData } from "@/models/TableList";
import { message } from 'antd';
import { IUserTableListItem, IUserTableListParams } from "@/models/UserTableList";
import { userStorage } from "@/utils/user.storage";

@injectable()
export default class UserState {

    @observable loading: boolean = false;
    @observable data!: ITableListData<IUserTableListItem>;
    @observable modalVisible: boolean = false;

    @action.bound
    async queryByPage(params?: Partial<IUserTableListParams>) {
        this.loading = true;
        const response = await queryByPage(params);
        this.loading = false;
        if (response) {
            let pageIndex = 1;
            if (params && params.PageNum) {
                pageIndex = params.PageNum;
            }
            response.Rows.forEach(i => {
                if (i.UserName.toLowerCase() === "admin") {
                    i.disabled = true;
                }
            });
            this.data = {
                list: response.Rows,
                pagination: {
                    total: response.TotalRows,
                    current: pageIndex
                }
            };
        }
    }

    //新增或者更新用户信息
    @action.bound
    async handleOk(params: Partial<IUserTableListItem>, callback?: () => void) {
        const response = params.Id ? await updateUser(params) : await addUser(params);
        if (response) {
            switch (response.Status) {
                case '0':
                    message.success(`${params.Id ? '更新' : '添加'}成功`);
                    if(callback){
                        callback();
                        this.queryByPage();
                    }
                    break;
                case '1':
                    message.error(`${params.Id ? '更新' : '添加'}失败`);
                    break;
                case '2':
                    message.warning('用户已存在');
                    break;
            }
        }
    }

    @action.bound
    async deleteUser(id: number) {
        const response = await deleteUser(id);
        if (response) {
            switch (response.Status) {
                case '0':
                    message.success('删除成功');
                    this.queryByPage();
                    break;
                case '1':
                    message.error('删除失败');
                    break;
            }

        }
    }
    //批量改变用户状态（启用，禁用）
    @action.bound
    async UpdateStatus(params: { Ids: Array<number>, Status: number }) {
        const response = await UpdateStatus(params);
        if (response) {
            switch (response.Status) {
                case '0':
                    message.success('更新成功');
                    this.queryByPage();
                    break;
                case '1':
                    message.error('更新失败');
                    break;
            }
        }
    }

    @action.bound
    handleModalVisible = (flag?: boolean) => {
        this.modalVisible == !!flag;
    };

    async getCurrentUser() {
        if (userStorage.CurrentUser) {
            return getCurrentUser(userStorage.CurrentUser.Uid);
        }
        return null;
    }
}
