<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="类别名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入类别名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
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
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-search"
          size="mini"
          @click="handleQuery"
        >搜索
        </el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          class="filter-item"
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="handleAdd"
          v-hasPerm="['category_add']"
        >新增
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

    <el-table
      v-loading="loading"
      :data="categoryList"
      row-key="id"
      default-expand-all
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column label="类别名称" align="center" prop="name"/>
      <el-table-column label="排序" align="center" prop="sort"/>
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
            v-hasPerm="['category_edit']"
          >修改
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-plus"
            @click="handleAdd(scope.row)"
            v-hasPerm="['menu_add']"
          >新增
          </el-button>
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDel(scope.row)"
            v-hasPerm="['category_del']"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改类别对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="500px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="类别名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入类别名称"/>
        </el-form-item>
        <el-form-item label="上级类别" prop="parentId">
          <treeselect v-model="form.parentId" :options="categoryOptions" :normalizer="normalizer"
                      placeholder="请选择上级类别"/>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序"/>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in statusOptions"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input v-model="form.remarks" type="textarea" placeholder="请输入备注"></el-input>
          </el-form-item>
        </el-col>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {listCategory, getCategory, delCategory, addCategory, editCategory, exportCategory} from "@/api/cms/category";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";

  export default {
    name: "Category",
    components: {Treeselect},
    data() {
      return {
        // 遮罩层
        loading: true,
        // 类别表格数据
        categoryList: [],
        // 类别树选项
        categoryOptions: [],
        // 弹出层标题
        title: "",
        // 是否显示弹出层
        open: false,
        // 日期范围
        dateRange: [],
        // 状态字典
        statusOptions: [],
        // 查询参数
        queryParams: {
          name: undefined,
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
            {required: true, message: "类别名称不能为空", trigger: "blur"}
          ],
          parentId: [
            {required: true, message: "上级类别不能为空", trigger: "blur"}
          ],
          sort: [
            {required: true, message: "排序不能为空", trigger: "blur"}
          ]
        }
      };
    },
    created() {
      this.getList();
      this.getDicts("status").then(response => {
        this.statusOptions = response.data;
      });
    },
    methods: {
      /** 查询类别列表 */
      getList() {
        this.loading = true;
        listCategory(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
          this.categoryList = this.handleTree(response.data, "id", "parentId");
          this.loading = false;
        });
      },
      /** 转换类别数据结构 */
      normalizer(node) {
        if (node.children && !node.children.length) {
          delete node.children;
        }
        return {
          id: node.id,
          label: node.name,
          children: node.children
        };
      },
      /** 查询部门下拉树结构 */
      getTreeselect() {
        listCategory().then(response => {
          this.categoryOptions = [];
          const data = {id: 0, name: '顶级节点', children: []};
          data.children = this.handleTree(response.data, "id", "parentId");
          this.categoryOptions.push(data);
        });
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
          parentId: undefined,
          ancestors: undefined,
          sort: undefined,
          status: "0",
          createBy: undefined,
          createTime: undefined,
          updateBy: undefined,
          updateTime: undefined,
          remarks: undefined,
          delFlag: undefined
        };
        this.resetForm("form");
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
      },
      /** 新增按钮操作 */
      handleAdd(row) {
        this.reset();
        this.getTreeselect();
        if (row != undefined) {
          this.form.parentId = row.id;
        }
        this.open = true;
        this.title = "添加类别";
      },
      /** 修改按钮操作 */
      handleEdit(row) {
        this.reset();
        this.getTreeselect();
        if (row != undefined) {
          this.form.parentId = row.id;
        }
        getCategory(row.id).then(response => {
          this.form = response.data;
          this.open = true;
          this.title = "修改类别";
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs["form"].validate(valid => {
          if (valid) {
            if (this.form.id != undefined) {
              editCategory(this.form).then(response => {
                if (response.code === 0) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                } else {
                  this.msgError(response.msg);
                }
              });
            } else {
              addCategory(this.form).then(response => {
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
        this.$confirm('是否确认删除类别编号为"' + row.id + '"的数据项?', "警告", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(function () {
          return delCategory(row.id);
        }).then(() => {
          this.getList();
          this.msgSuccess("删除成功");
        }).catch(function () {
        });
      }
    }
  };
</script>
