<template>
  <el-form ref="genInfoForm" :model="info" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="8">
        <el-form-item prop="tplCategory">
          <span slot="label">生成模板</span>
          <el-select v-model="info.tplCategory">
            <el-option label="单表（增删改查）" value="crud"/>
            <el-option label="树表（增删改查）" value="tree"/>
            <!--<el-option label="左树右表（增删改查）" value="ltyt"/>-->
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="8">
        <el-form-item prop="tplCategory">
          <span slot="label">生成分栏</span>
          <el-select v-model="info.cols">
            <el-option label="一栏" value="24"/>
            <el-option label="二栏" value="12"/>
            <el-option label="三栏" value="8"/>
            <el-option label="四栏" value="6"/>
          </el-select>
        </el-form-item>
      </el-col>

      <el-col :span="8">
        <el-form-item prop="menuId">
          <span slot="label">父级菜单</span>
          <treeselect v-model="info.menuId" :options="info.menus" :normalizer="normalizer" placeholder="请选择"/>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="packageName">
          <span slot="label">
            生成包路径
            <el-tooltip content="生成在哪个java包下，例如 com.entfrm.biz.system" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input v-model="info.packageName"/>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="moduleName">
          <span slot="label">
            生成模块名
            <el-tooltip content="可理解为子系统名，例如 system" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input v-model="info.moduleName"/>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="businessName">
          <span slot="label">
            生成业务名
            <el-tooltip content="可理解为功能英文名，例如 user" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input v-model="info.businessName"/>
        </el-form-item>
      </el-col>

      <el-col :span="12">
        <el-form-item prop="functionName">
          <span slot="label">
            生成功能名
            <el-tooltip content="用作类描述，例如 用户" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input v-model="info.functionName"/>
        </el-form-item>
      </el-col>

      <el-col :span="24">
        <el-form-item prop="genPath">
          <span slot="label">
            生成文件路径
            <el-tooltip content="只填写项目路径即可" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-input v-model="info.genPath" placeholder="填写项目路径，如D://entfrm-boot"/>
        </el-form-item>
      </el-col>

    </el-row>

    <el-row v-show="info.tplCategory == 'tree'">
      <h4 class="form-header">其他信息</h4>
      <el-col :span="12">
        <el-form-item>
          <span slot="label">
            树编号字段
            <el-tooltip content="树显示的编号字段名， 如：id" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-select v-model="info.treeId" placeholder="请选择">
            <el-option
              v-for="column in info.columns"
              :key="column.columnName"
              :label="column.columnName + '：' + column.columnComment"
              :value="column.columnName"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item>
          <span slot="label">
            树父编号字段
            <el-tooltip content="树显示的父编号字段名， 如：parent_Id" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-select v-model="info.treeParentId" placeholder="请选择">
            <el-option
              v-for="column in info.columns"
              :key="column.columnName"
              :label="column.columnName + '：' + column.columnComment"
              :value="column.columnName"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item>
          <span slot="label">
            树名称字段
            <el-tooltip content="树节点的显示名称字段名， 如：name" placement="top">
              <i class="el-icon-question"></i>
            </el-tooltip>
          </span>
          <el-select v-model="info.treeName" placeholder="请选择">
            <el-option
              v-for="column in info.columns"
              :key="column.columnName"
              :label="column.columnName + '：' + column.columnComment"
              :value="column.columnName"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script>
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  export default {
    name: "GenInfoForm",
    components: {Treeselect},
    props: {
      info: {
        type: Object,
        default: null
      }
    },
    data() {
      return {
        rules: {
          tplCategory: [
            {required: true, message: "请选择生成模板", trigger: "blur"}
          ],
          packageName: [
            {required: true, message: "请输入生成包路径", trigger: "blur"}
          ],
          moduleName: [
            {required: true, message: "请输入生成模块名", trigger: "blur"}
          ],
          businessName: [
            {required: true, message: "请输入生成业务名", trigger: "blur"}
          ],
          functionName: [
            {required: true, message: "请输入生成功能名", trigger: "blur"}
          ],
          cols: [
            {required: true, message: "请选择生成分栏", trigger: "blur"}
          ],
          genPath: [
            {required: true, message: "请输入生成文件路径", trigger: "blur"}
          ],
          menuId: [
            {required: true, message: "请选择父级菜单", trigger: "blur"}
          ]
        }
      };
    },
    created() {

    },
    methods: {
      /** 转换菜单结构 */
      normalizer(node) {
        if (node.children && !node.children.length) {
          delete node.children;
        }
        return {
          id: node.id,
          label: node.name,
          children: node.children
        };
      }
    }
  };
</script>
<style scoped>

</style>
