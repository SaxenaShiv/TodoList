import React from "react";
import { Button, message } from "antd";
import ProForm, {
  ModalForm,
  ProFormText,
  ProFormDatePicker,
  ProFormSelect,
  ProFormTextArea,
} from "@ant-design/pro-form";
import request from "umi-request";

const Form = ({ tableRef }) => {
  const handleSubmit = async (values) => {
    if (values.tags === undefined || values.tags.trim().length === 0) {
      values.tags = [];
    } else {
      const temp = values.tags.split(",");
      values.tags = temp;
    }
    try {
      await request.post(`http://localhost:3001/api/v1/todo`, {
        data: values,
      });
      tableRef.current.reload();
      message.success("Record added successfully!");
    } catch (err) {
      console.log(err);
      message.error("Failed to add record!");
    }
  };

  return (
    <ModalForm
      title="Create a new Task"
      trigger={
        <Button type="primary" style={{ marginLeft: "10%" }}>
          Add
        </Button>
      }
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        onCancel: () => {},
      }}
      onFinish={(values) => {
        handleSubmit(values);
        return true;
      }}
    >
      <ProFormText
        name="title"
        label="Task Title"
        tooltip="Example : Title 1"
        placeholder="Enter title here..."
        rules={[{ required: true, message: "Please enter the title!" }]}
      />
      <ProFormTextArea
        name="description"
        label="Description"
        tooltip="Example : Some description for task..."
        placeholder="Enter Description here..."
        rules={[{ required: true, message: "Please enter the description!" }]}
      />
      <ProForm.Group style={{ width: "100%" }}>
        <ProFormDatePicker
          name="due_date"
          label="Pick a due Date"
          width="sm"
          format="YYYY-MM-DD"
        />
        <ProFormText
          name="tags"
          label="Enter Tags"
          tooltip="Example : Tag1, Tag2"
          placeholder="Tag1, Tag2, Tag3 etc."
        />
        <ProFormSelect
          width="sm"
          name="status"
          label="Select task operation"
          options={[
            { label: "OPEN", value: "OPEN" },
            { label: "WORKING", value: "WORKING" },
            { label: "DONE", value: "DONE" },
            { label: "OVERDUE", value: "OVERDUE" },
          ]}
          placeholder="Select a task operation"
          rules={[
            { required: true, message: "Please select a task operation" },
          ]}
        />
      </ProForm.Group>
    </ModalForm>
  );
};

export default Form;
