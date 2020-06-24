<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="模板名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入模板名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="模板类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择模板类型" clearable size="small">
          <el-option
            v-for="dict in typeOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option
            v-for="dict in statusOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker v-model="dateRange"
                        size="small"
                        style="width: 240px"
                        value-format="yyyy-MM-dd"
                        type="daterange"
                        range-separator="-"
                        start-placeholder="开始日期"
                        end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPerm="['infoTemplate_add']"
        >新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          icon="el-icon-edit"
          size="mini"
          :disabled="single"
          @click="handleEdit"
          v-hasPerm="['infoTemplate_edit']"
        >修改
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          icon="el-icon-delete"
          size="mini"
          :disabled="multiple"
          @click="handleDel"
          v-hasPerm="['infoTemplate_del']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPerm="['infoTemplate_export']"
        >导出
        </el-button>
      </el-col>
      <div class="top-right-btn">
        <el-tooltip class="item" effect="dark" content="刷新" placement="top">
          <el-button size="mini" circle icon="el-icon-refresh" @click="handleQuery"/>
        </el-tooltip>
        <el-tooltip class="item" effect="dark" :content="showSearch ? '隐藏搜索' : '显示搜索'" placement="top">
          <el-button size="mini" circle icon="el-icon-search" @click="showSearch=!showSearch"/>
        </el-tooltip>
      </div>
    </el-row>

    <el-table v-loading="loading" :data="infoTemplateList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <!--<el-table-column label="编号" align="center" prop="id"/>-->
      <el-table-column label="模板名称" align="center" prop="name"/>
      <el-table-column label="模板类型" align="center" prop="type" :formatter="typeFormat"/>
      <el-table-column label="模板键值" align="center" prop="tplKey"/>
      <el-table-column label="模板内容" align="center" prop="tplContent" :show-overflow-tooltip="true"/>
      <el-table-column label="状态" align="center" prop="status" :formatter="statusFormat"/>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-edit"
            @click="handleEdit(scope.row)"
            v-hasPerm="['infoTemplate_edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDel(scope.row)"
            v-hasPerm="['infoTemplate_del']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.current"
      :limit.sync="queryParams.size"
      @pagination="getList"
    />

    <!-- 添加或修改消息模板对话框 -->
    <el-dialog :title="title" :visible.sync="open">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="模板类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择模板类型">
                <el-option
                  v-for="dict in typeOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板键值" prop="tplKey">
              <el-input v-model="form.tplKey" placeholder="请输入模板键值"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="模板名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入模板名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="模板内容" prop="tplContent">
              <el-input type="textarea" v-model="form.tplContent" rows="3" placeholder="请输入模板内容"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remarks">
              <el-input type="textarea" v-model="form.remarks" rows="3" placeholder="请输入备注"/>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    listInfoTemplate,
    getInfoTemplate,
    delInfoTemplate,
    addInfoTemplate,
    editInfoTemplate,
    exportInfoTemplate
  } from "@/api/msg/infoTemplate";

  export default {
    name: "InfoTemplate",
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 消息模板表格数据
        infoTemplateList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 日期范围
        dateRange: [],
        // 模板类型字典
        typeOptions: [],                                                                                                                                                                                                                                                                                // 状态字典
        statusOptions: [],                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            // 查询参数
        queryParams: {
          current: 1,
          size: 10,
          name: undefined,
          type: undefined,
          status: undefined,
          createTime: undefined,
        },
        // 显示搜索条件
        showSearch: true,
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          name: [
            {required: true, message: "名称不能为空", trigger: "blur"}
          ],
          type: [
            {required: true, message: "类型不能为空", trigger: "blur"}
          ],
          tplKey: [
            {required: true, message: "键值不能为空", trigger: "blur"}
          ],
          tplContent: [
            {required: true, message: "内容不能为空", trigger: "blur"}
          ],
        }
      };
    },
    created() {
      this.getList();
      this.getDicts("msg_type").then(response => {
        this.typeOptions = response.data;
      });
      this.getDicts("status").then(response => {
        this.statusOptions = response.data;
      });
    },
    methods: {
      /** 查询消息模板列表 */
      getList() {
        this.loading = true;
        listInfoTemplate(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.infoTemplateList = response.data;
          this.total = response.total;
          this.loading = false;
        });
      },
      // 模板类型字典翻译
      typeFormat(row, column) {
        return this.selectDictLabel(this.typeOptions, row.type);
      },
      // 状态字典翻译
      statusFormat(row, column) {
        return this.selectDictLabel(this.statusOptions, row.status);
      },
      // 取消按钮
      cancel() {
        this.open = false;
        this.reset();
      },
      // 表单重置
      reset() {
        this.form = {
          id: undefined,
          name: undefined,
          type: undefined,
          tplKey: undefined,
          tplContent: undefined,
          status: "0",
          remarks: undefined
        };
        this.resetForm("form");
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.current = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.id)
        this.single = selection.length != 1
        this.multiple = !selection.length
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
        this.title = "添加消息模板";
      },
      /** 修改按钮操作 */
      handleEdit(row) {
        this.reset();
        const id = row.id || this.ids
        getInfoTemplate(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改消息模板";
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != undefined) {
              editInfoTemplate(this.form).then(response => {
                if (response.code === 0) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            } else {
              addInfoTemplate(this.form).then(response => {
                if (response.code === 0) {
                  this.msgSuccess("新增成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            }
          }
        });
      },
      /** 删除按钮操作 */
      handleDel(row) {
        const ids = row.id || this.ids;
        this.$confirm('是否确认删除消息模板编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return delInfoTemplate(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function () {
        });
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有消息模板数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return exportInfoTemplate(queryParams);
        }).then(response => {
          this.download(response.data);
        }).catch(function () {
        });
      }
    }
  };
</script>
