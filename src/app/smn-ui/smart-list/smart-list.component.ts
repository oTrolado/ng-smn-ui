import {Component, OnInit, Input, DoCheck, KeyValueDiffers} from '@angular/core';

@Component({
    selector: 'ui-smart-list',
    templateUrl: 'smart-list.component.html'
})

export class UiSmartListComponent implements OnInit, DoCheck {
    @Input() model: any;
    @Input('default-item') defaultItem: any;
    list: any[];
    differ: any;
    objDiffer: { string?: any };

    constructor(private differs: KeyValueDiffers) {
        this.differ = differs.find([]).create(null);
    }

    ngOnInit() {
        if (!this.defaultItem) {
            this.defaultItem = {};
        }
        this.list = [Object.assign({}, this.defaultItem)];
        if (!this.model) {
            console.error('Você precisa declarar a model no seu componente');
        }
        this.objDiffer = {};
        this.list.forEach((elt, i) => {
            this.objDiffer[i] = this.differs.find(elt).create(null);
        });
    }

    ngDoCheck() {
        let wasChanged = false;

        this.list.forEach((elt, i) => {
            let objDiffer = this.objDiffer[i];
            if (!objDiffer) {
                objDiffer = this.objDiffer[i] = this.differs.find(elt).create(null);
            }
            const objChanges = objDiffer.diff(elt);
            if (objChanges) {
                wasChanged = true;
                objChanges.forEachChangedItem((elt2) => {
                    if (!elt2.currentValue && typeof elt2.currentValue !== 'number' && typeof elt2.currentValue !== 'boolean') {
                        delete elt[elt2.key];
                    }
                });

                if (elt && this.model.indexOf(elt) < 0 && (Object.keys(elt).length > Object.keys(this.defaultItem).length)) {
                    this.model.push(elt);
                }

                if (elt && (Object.keys(elt).length === Object.keys(this.defaultItem).length) && equals(elt, this.defaultItem) && this.model.length && this.model.indexOf(elt) > -1) {
                    this.model.splice(this.model.indexOf(elt), 1);
                }
            }
        });

        if (wasChanged) {
            this.newItem();
        }
    }

    newItem() {
        let found = 0;

        this.list.forEach((item) => {
            if (item && (Object.keys(item).length <= Object.keys(this.defaultItem).length) && equals(item, this.defaultItem)) {
                found++;
                const element = this.list[this.list.indexOf(item)];
                this.list.splice(this.list.indexOf(item), 1);
                this.list.splice(this.list.length, 0, element);
            }
        });

        if (!found) {
            this.list.push(Object.assign({}, this.defaultItem));
        } else {
            setTimeout(() => {
                this.list.splice(this.list.length - 1, 1);
                this.newItem();
            });
        }
    }

    remove(i) {
        Object.keys(this.list[i]).forEach((key) => {
            if (!Object.keys(this.defaultItem).includes(key)) {
                delete this.list[i][key];
            } else {
                this.list[i][key] = this.defaultItem[key];
            }
        });
        this.ngDoCheck();
    }
}


function equals(x, y) {
    return JSON.stringify(x) === JSON.stringify(y);
}