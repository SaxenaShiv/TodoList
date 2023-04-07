import React, { useState, useRef } from "react";
import enUS from "antd/lib/locale/en_US";
import {
  Button,
  Input,
  Tag,
  Space,
  ConfigProvider,
  Popconfirm,
  message,
  Tooltip,
} from "antd";
import Highlighter from "react-highlight-words";
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import ProTable from "@ant-design/pro-table";
import "antd/dist/antd.css";
import "@ant-design/pro-table/dist/table.css";
import request from "umi-request";
import Form from "../form/Form";

const Todo = () => {
  const [editableKeys, setEditableRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');


  const ref = useRef();
  const inputRef = useRef({});

  
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };
  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
    
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={(node) => {
            inputRef.current[dataIndex] = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: "100%" }}
          >
            Search
          </Button>
          <Button
            onClick={() => handleReset(clearFilters)}
            size="small"
            style={{ width: "100%" }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes(value.toLowerCase())
        : "",
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => inputRef.current.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      dataIndex: "index",
      valueType: "indexBorder",
      width: 48,
    },
    {
      title: "Time Stamp",
      dataIndex: "timestamp",
      valueType: "dateTime",
      width: 220,
      defaultSortOrder: "descend",
      showSorterTooltip: false,
      sorter: (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      sortDirections: ["ascend", "descend"],
      editable: false,
      search: false,
    },
    {
      title: "Title",
      dataIndex: "title",
      width: 200,
      showSorterTooltip: false,
      sortDirections: ["ascend", "descend"],
      sorter: (a, b) => a.title.localeCompare(b.title),
      ...getColumnSearchProps('title'), //this is used for search operation according to title
    },
    {
      title: "Description",
      dataIndex: "description",
      width: 350,
      showSorterTooltip: false,
      sortDirections: ["ascend", "descend"],
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (text) => (
        <div title={text}>{text.length > 1000 ? text.substr(0, 1000) + "..." : text}</div>
      ),
      ...getColumnSearchProps("description"),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      valueType: "date",
      showSorterTooltip: false,
      sorter: (a, b) => new Date(a.due_date) - new Date(b.due_date),
      sortDirections: ["ascend", "descend"],
      align: "center",
    },
    {
      title: "Tags",
      dataIndex: "tags",
      search: false,
      ...getColumnSearchProps("tags"),
      render: (data) => (
        <Space
          style={{
            width: 200,
            flexWrap: "wrap",
          }}
        >
          {data.length > 0 ? (
            data.map((tag) => (
              <Tag color="blue" key={tag}>
                {tag}
              </Tag>
            ))
          ) : (
            <span style={{ position: "absolute", left: "48%", top: "17.9px" }}>
              -
            </span>
          )}
        </Space>
      ),
    },
    {
      title: "Status",
      width: 100,
      dataIndex: "status",
      valueEnum: {
        OPEN: { text: "OPEN", status: "Default" },
        WORKING: { text: "WORKING", status: "Processing" },
        DONE: { text: "DONE", status: "Success" },
        OVERDUE: { text: "OVERDUE", status: "Error" },
      },
      filters: [
        {
          text: "OPEN",
          value: "OPEN",
        },
        {
          text: "DONE",
          value: "DONE",
        },
        {
          text: "WORKING",
          value: "WORKING",
        },
        {
          text: "OVERDUE",
          value: "OVERDUE",
        },
      ],
      filterMultiple: false,
      onFilter: (value, record) => record.status.includes(value),
    },
    {
      title: "Options",
      width: 180,
      key: "option",
      valueType: "option",
      align: "center",
      render: (text, record, _, action) => [
        <Tooltip title="edit" key={record._id}>
          <Button
            type="primary"
            shape="circle"
            key="editable"
            onClick={() => {
              action?.startEditable?.(record._id);
            }}
          >
            <EditOutlined />
          </Button>
        </Tooltip>,
        <Popconfirm
          key={record._id}
          title="Are you sure to delete this task?"
          onConfirm={() => {
            request
              .delete(
                `http://localhost:3001/api/v1/todo/${record._id}/`
              )
              .then(() => {
                ref.current.reload();
                message.success("Record deleted successfully!");
              })
              .catch((err) => console.error(err));
              // message.error("Failed to delete the record. Please check the console for more information.");
          }}
          okText="Yes"
          cancelText="No"
        >
          <Tooltip title="delete">
            <Button type="danger" shape="circle">
              <DeleteOutlined />
            </Button>
          </Tooltip>
        </Popconfirm>,
      ],
    },
  ];

  return (
    <ConfigProvider locale={enUS}>
      <ProTable
        actionRef={ref}
        columns={columns}
        request={async (params = {}, sort, filter) => {
          const data = await request(
            "http://localhost:3001/api/v1/todo/",
            {
              params: {
                ...params,
                offset: params.current * params.pageSize - params.pageSize,
                limit: params.pageSize,
              },
            }
          );
          console.log("Fetched data:", data);
          return {
            data: data,
            success: true,
            total: data.length,
          };
        }}
        scroll={{ x: "max-content" }}
        style={{ padding: "20px 30px" }}
        rowKey="_id" // Change 'id' to '_id'
        search={false}
        pagination={{
          pageSize: 15,
          showSizeChanger: false,
        }}
        dateFormatter="string"
        headerTitle="Todo List"
        editable={{
          type: "multiple",
          editableKeys,
          onSave: async (rowKey, data, row) => {
            // ... rest of the onSave implementation
          },
          onCancel: async (rowKey, data, row) => {},
          onChange: setEditableRowKeys,
          actionRender: (row, config, defaultDom) => {
            return [defaultDom.save, defaultDom.cancel];
          },
        }}
        toolBarRender={() => [<Form tableRef={ref} />]}
      />
    </ConfigProvider>
  );
};

export default Todo;