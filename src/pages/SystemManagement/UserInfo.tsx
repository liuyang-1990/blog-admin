import React, { Component } from 'react';
import { PageHeaderWrapper } from '@ant-design/pro-layout';
import { SorterResult } from 'antd/es/table';
import {
    Button,
    Card,
    Col,
    Divider,
    Dropdown,
    Form,
    Icon,
    Input,
    Menu,
    Row,
    Select,
    Popconfirm,
} from 'antd';
import styles from './style.less';
import StandardTable, { StandardTableColumnProps } from '@/components/StandardTable';
import { toLocaleTimeString } from '@/utils/utils';
import { observer } from 'mobx-react';
import { lazyInject } from '@/utils/ioc';
import UserState from '@/states/user.state';
import CreateForm from '@/components/StandardTable/CreateForm';
import { IUserTableListItem, IUserTableListParams } from '@/models/UserTableList';
import { ITableListPagination } from '@/models/TableList';
import { FormComponentProps } from 'antd/lib/form';

const FormItem = Form.Item;
const { Option } = Select;

const getValue = (obj: { [x: string]: string[] }) =>
    Object.keys(obj)
        .map(key => obj[key])
        .join(',');

interface IUserInfoProps extends FormComponentProps {

}

interface IUserInfoState {
    modalVisible: boolean;
    selectedRows: IUserTableListItem[];
    formValues: { [key: string]: string };
    modalFormValues: Partial<IUserTableListItem>;
    enableShow: boolean; //更多操作按钮显示启用还是禁用 true-> 启用 false->禁用
}

@observer
class UserInfo extends Component<IUserInfoProps, IUserInfoState> {

    @lazyInject('UserState')
    private store!: UserState;

    constructor(props: IUserInfoProps) {
        super(props);
        this.state = {
            selectedRows: [],
            formValues: {},
            modalVisible: false,
            enableShow: false,
            modalFormValues: {}
        }
    }
    columns: StandardTableColumnProps<IUserTableListItem>[] = [
        {
            title: '用户名',
            align: 'center',
            dataIndex: 'UserName',
            width: '20%',
        }, {
            title: '角色',
            align: 'center',
            dataIndex: 'Role',
            render: role => role === 1 ? "管理员" : "游客",
            width: '20%',
        }, {
            title: '状态',
            align: 'center',
            render: status => status === 1 ? "启用" : "禁用",
            dataIndex: 'Status',
            width: '20%',
        }, {
            title: '创建时间',
            align: 'center',
            sorter: true,
            dataIndex: 'CreateTime',
            render: (createTime: string) => <span>{toLocaleTimeString(createTime)}</span>,
        },
        {
            title: '操作',
            align: 'center',
            key: 'x',
            render: (record: IUserTableListItem) => !record.disabled &&
                <React.Fragment>
                    <a onClick={() => this.handleModalVisible(true, record)}>编辑</a>
                    <Divider type="vertical" />
                    <Popconfirm title="是否要删除此行？" onConfirm={() => this.remove(record.Id)}>
                        <a>删除</a>
                    </Popconfirm>
                </React.Fragment>
        },
    ];

    remove = (key: number) => {
        this.store.deleteUser(key);
    }

    componentDidMount() {
        this.store.queryByPage();
    }

    handleSelectChange = (value: number) => {
        this.handleSelectRows([]);
        this.setState({ enableShow: !value });
        this.store.queryByPage({ "Status": value });
    }

    handleSelectRows = (rows: IUserTableListItem[]) => {
        this.setState({
            selectedRows: rows,
        });
    };
    //搜索
    handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const { form } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            const values = { ...fieldsValue };
            this.setState({
                formValues: values,
            });
            this.store.queryByPage(values);
        });
    }
    //重置
    handleFormReset = () => {
        this.props.form.resetFields();
        this.setState({
            formValues: {},
        });
        this.store.queryByPage();
    }
    handleMenuClick = (e: { key: string }) => {
        const { selectedRows, enableShow } = this.state;
        if (!selectedRows) return;
        switch (e.key) {
            case 'update':
                this.store.UpdateStatus({
                    Ids: selectedRows.map(row => row.Id),
                    Status: enableShow ? 1 : 0
                });
                this.handleSelectRows([]);
                break;
        }
    }

    handleTableChange = (
        pagination: Partial<ITableListPagination>,
        filtersArg: Record<keyof IUserTableListItem, string[]>,
        sorter: SorterResult<IUserTableListItem>,
    ) => {
        const { formValues } = this.state;
        const filters = Object.keys(filtersArg).reduce((obj, key) => {
            const newObj = { ...obj };
            newObj[key] = getValue(filtersArg[key]);
            return newObj;
        }, {});

        const params: Partial<IUserTableListParams> = {
            PageNum: pagination.current,
            PageSize: pagination.pageSize,
            ...formValues,
            ...filters,
        };
        if (sorter.field) {
            params.SortField = sorter.field;
            switch (sorter.order) {
                case 'ascend':
                    params.SortOrder = 'asc';
                    break;
                case 'descend':
                    params.SortOrder = 'desc';
                    break;
            }
        }
        this.store.queryByPage(params);
    }



    renderSearchForm() {
        const {
            form: { getFieldDecorator },
        } = this.props;
        return (
            <Form onSubmit={this.handleSearch} layout="inline">
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                    <Col md={8} sm={24}>
                        <FormItem label={"用户名"}>
                            {getFieldDecorator('UserName')(<Input placeholder="用户名" />)}
                        </FormItem >
                    </Col>
                    <Col md={8} sm={24}>
                        <FormItem label={"状态"}>
                            {getFieldDecorator('Status', {
                                initialValue: 1
                            })(
                                <Select style={{ width: '100%' }} onChange={this.handleSelectChange}>
                                    <Option value={1}>启用</Option>
                                    <Option value={0}>禁用</Option>
                                </Select>)}
                        </FormItem>
                    </Col>
                </Row>
                <div style={{ overflow: 'hidden' }}>
                    <div style={{ float: 'right', marginBottom: 24 }}>
                        <Button type="primary" htmlType="submit">
                            查询
                        </Button>
                        <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                            清空
                        </Button>
                    </div>
                </div>

            </Form>
        );
    }

    handleOk = async (params: Partial<IUserTableListItem>, callback?: () => void) => {
        await this.store.handleOk(params, callback);
    }

    handleModalVisible = (flag?: boolean, record?: Partial<IUserTableListItem>) => {
        const values = record ? {
            Id: record.Id,
            UserName: record.UserName,
            Role: record.Role,
            Status: record.Status
        } : { Status: 1, Role: 0 };
        this.setState({
            modalFormValues: values,
            modalVisible: !!flag
        });
    };

    render() {
        const { selectedRows, modalVisible, enableShow, modalFormValues } = this.state;
        const menu = (
            <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
                <Menu.Item key="update">批量{enableShow ? '启用' : '禁用'}</Menu.Item>
            </Menu>
        );
        return (
            <PageHeaderWrapper>
                <Card bordered={false}>
                    <div className={styles.tableList}>
                        <div className={styles.tableListForm}>
                            {this.renderSearchForm()}
                        </div>
                        <div className={styles.tableListOperator}>
                            <Button type="primary" onClick={() => this.handleModalVisible(true)}>
                                新建
                            </Button>
                            {selectedRows.length > 0 && (
                                <span>
                                    <Dropdown overlay={menu}>
                                        <Button>
                                            更多操作 <Icon type="down" />
                                        </Button>
                                    </Dropdown>
                                </span>
                            )}
                        </div>
                        <StandardTable
                            selectedRows={selectedRows}
                            loading={this.store.loading}
                            data={this.store.data}
                            columns={this.columns}
                            onSelectRow={this.handleSelectRows}
                            onChange={this.handleTableChange}
                        />
                    </div>
                </Card>
                {modalFormValues && Object.keys(modalFormValues).length ?
                    <CreateForm
                        key={modalFormValues.Id}
                        handleOk={this.handleOk}
                        handleModalVisible={this.handleModalVisible}
                        modalVisible={modalVisible}
                        values={modalFormValues}
                    /> : null}
            </PageHeaderWrapper>
        );
    }
}
export default Form.create<any>()(UserInfo);
