<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择类型" clearable size="small">
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
          v-hasPerm="['infoConfig_add']"
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
          v-hasPerm="['infoConfig_edit']"
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
          v-hasPerm="['infoConfig_del']"
        >删除
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          icon="el-icon-download"
          size="mini"
          @click="handleExport"
          v-hasPerm="['infoConfig_export']"
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

    <el-table v-loading="loading" :data="infoConfigList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column label="编号" width="50" align="center" prop="id"/>
      <el-table-column label="名称" align="center" prop="name"/>
      <el-table-column label="类型" width="60" align="center" prop="type" :formatter="typeFormat"/>
      <el-table-column label="模板code" align="center" prop="templateCode"/>
      <el-table-column label="地址" :show-overflow-tooltip="true" align="center" prop="host"/>
      <el-table-column label="状态" width="60" align="center" prop="status" :formatter="statusFormat"/>
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
            v-hasPerm="['infoConfig_edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDel(scope.row)"
            v-hasPerm="['infoConfig_del']"
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

    <!-- 添加或修改消息配置对话框 -->
    <el-dialog :title="title" :visible.sync="open">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入名称"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型">
              <el-select v-model="form.type" placeholder="请选择类型">
                <el-option
                  v-for="dict in typeOptions"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type == '0'" :span="12">
            <el-form-item label="keyId" prop="accessKeyId">
              <el-input v-model="form.accessKeyId" placeholder="请输入keyId"/>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type == '0'" :span="12">
            <el-form-item label="keySecret" prop="accessKeySecret">
              <el-input v-model="form.accessKeySecret" placeholder="请输入keySecret"/>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type == '0'" :span="12">
            <el-form-item label="签名" prop="signName">
              <el-input v-model="form.signName" placeholder="请输入签名"/>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="模板code" prop="templateCode">
              <el-input v-model="form.templateCode" placeholder="请输入模板code"/>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type == '1'" :span="12">
            <el-form-item label="发送人" prop="fromBy">
              <el-input v-model="form.fromBy" placeholder="请输入发送人"/>
            </el-form-item>
          </el-col>
          <!--<el-col :span="12">
            <el-form-item label="模板参数" prop="templateParam">
              <el-input v-model="form.templateParam" type="textarea" placeholder="请输入内容"/>
            </el-form-item>
          </el-col>-->
          <el-col :span="12">
            <el-form-item label="地址" prop="host">
              <el-input v-model="form.host" placeholder="请输入地址"/>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type == '1'" :span="12">
            <el-form-item label="端口" prop="port">
              <el-input-number v-model="form.port" controls-position="right" :min="0" placeholder="请输入端口"/>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type == '1'" :span="12">
            <el-form-item label="用户名" prop="user">
              <el-input v-model="form.user" placeholder="请输入用户名"/>
            </el-form-item>
          </el-col>
          <el-col v-if="form.type == '1'" :span="12">
            <el-form-item label="密码" prop="pass">
              <el-input v-model="form.pass" placeholder="请输入密码"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="其他信息" prop="otherInfo">
              <el-input v-model="form.otherInfo" type="textarea" placeholder="请输入内容"/>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remarks">
              <el-input v-model="form.remarks" type="textarea" placeholder="请输入备注"/>
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
    listInfoConfig,
    getInfoConfig,
    delInfoConfig,
    addInfoConfig,
    editInfoConfig,
    exportInfoConfig
  } from "@/api/msg/infoConfig";

  export default {
    name: "InfoConfig",
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
        // 消息配置表格数据
        infoConfigList: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 日期范围
        dateRange: [],
        // 类型字典
        typeOptions: [],      // 状态字典
        statusOptions: [],      // 查询参数
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
      /** 查询消息配置列表 */
      getList() {
        this.loading = true;
        listInfoConfig(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.infoConfigList = response.data;
          this.total = response.total;
          this.loading = false;
        });
      },
      // 类型字典翻译
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
          type: '0',
          accessKeyId: undefined,
          accessKeySecret: undefined,
          signName: undefined,
          templateCode: undefined,
          templateParam: undefined,
          host: undefined,
          port: undefined,
          user: undefined,
          pass: undefined,
          otherInfo: undefined,
          status: '0'
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
        this.title = "添加消息配置";
      },
      /** 修改按钮操作 */
      handleEdit(row) {
        this.reset();
        const id = row.id || this.ids
        getInfoConfig(id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改消息配置";
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != undefined) {
              editInfoConfig(this.form).then(response => {
                if (response.code === 0) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            } else {
              addInfoConfig(this.form).then(response => {
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
        this.$confirm('是否确认删除消息配置编号为"' + ids + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return delInfoConfig(ids);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function () {
        });
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有消息配置数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return exportInfoConfig(queryParams);
        }).then(response => {
          this.download(response.data);
        }).catch(function () {
        });
      }
    }
  };
</script>
