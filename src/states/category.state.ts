import { injectable } from "inversify";
import { observable, action } from "mobx";
import { message } from "antd";
import { ITableListData } from "@/models/TableList";
import { ICategoryTableListItem, ICategoryTableListParams } from "@/models/CategoryTableList";
import { queryByPage, updateCategory, addCategory, deleteCategory } from "@/services/category.service";


@injectable()
export default class CategoryState {

    @observable loading: boolean = false;
    @observable data!: ITableListData<ICategoryTableListItem>;;

    @action.bound
    async queryByPage(params?: Partial<ICategoryTableListParams>) {
        this.loading = true;
        const response = await queryByPage(params);
        this.loading = false;
        if (response) {
            let pageIndex = 1;
            if (params && params.PageNum) {
                pageIndex = params.PageNum;
            }
            response.Rows.forEach(i => {
                i.key = i.Id.toString()
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

    @action.bound
    async handleOk(params, callback?) {
        const response = params.Id ? await updateCategory(params) : await addCategory(params);
        if (response) {
            switch (response.Status) {
                case '0':
                    message.success(`${params.Id ? '更新' : '添加'}成功`);
                    callback && callback();
                    this.queryByPage();
                    break;
                case '1':
                    message.error(`${params.Id ? '更新' : '添加'}失败`);
                    break;
                case '2':
                    message.warning('分类已存在');
                    break;
            }
        }
    }

    @action.bound
    async deleteCategory(id: number) {
        const response = await deleteCategory(id);
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


}
